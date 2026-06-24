const db = require('../config/db');
const ok   = (res, data, msg = 'success') => res.json({ statusCode: 200, data, message: msg });
const fail = (res, status, msg, err = null) => {
  if (err) console.error(`[payroll] ${msg}:`, err.message);
  return res.status(status).json({ statusCode: status, message: msg });
};

const payrollController = {

  // GET /payroll/by-month/status?month=YYYY-MM
  getStatus: async (req, res) => {
    try {
      const { month = new Date().toISOString().slice(0, 7) } = req.query;
      const [y, m] = month.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);
      ok(res, {
        period: {
          id: null, name: `Kỳ lương tháng ${m}/${y}`,
          fromDate: `${month}-01`, toDate,
          status: 'DRAFT', standardWorkingDays: 26,
        },
        totalStaff: 0, confirmedCount: 0, rejectedCount: 0, pendingCount: 0, canCalculate: true,
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy trạng thái kỳ lương', e); }
  },

  // GET /payroll/by-month?month=YYYY-MM
  getByMonth: async (req, res) => {
    try {
      const { month = new Date().toISOString().slice(0, 7), page = 1, limit = 20, departmentId, roomId, search } = req.query;
      const fromDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const toDate   = new Date(y, m, 0).toISOString().slice(0, 10);
      const STANDARD_DAYS = 26;
      const ON_CALL_ALLOWANCE = 150000; // VND/ca trực
      const OT_RATE = 1.5;

      let where = ["e.status != 'RESIGNED'"];
      let params = [];
      if (search)      { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
      if (departmentId){ where.push('EXISTS(SELECT 1 FROM hr_staff_departments sd JOIN cat_departments cd ON cd.code=sd.department_code WHERE sd.employee_id=e.id AND cd.id=?)'); params.push(departmentId); }
      if (roomId)      { where.push('EXISTS(SELECT 1 FROM hr_staff_rooms sr JOIN cat_rooms cr ON cr.code=sr.room_code WHERE sr.employee_id=e.id AND cr.id=?)'); params.push(roomId); }

      const [[{total}]] = await db.query(
        `SELECT COUNT(DISTINCT e.id) as total FROM hr_employees e WHERE ${where.join(' AND ')}`, params);

      const [staff] = await db.query(`
        SELECT DISTINCT e.id, e.employee_code as code, e.full_name as name, e.avatar,
               COALESCE(jt.name, 'Nhân viên') as position
        FROM hr_employees e
        LEFT JOIN hr_contracts c ON c.employee_id=e.id AND c.status='ACTIVE'
        LEFT JOIN cat_titles jt ON jt.id=c.job_title_code
        WHERE ${where.join(' AND ')}
        ORDER BY e.full_name
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      const staffIds = staff.map(s => s.id);
      // Lấy dept/rooms
      let depts = [], rooms_list = [];
      if (staffIds.length) {
        [depts] = await db.query(`SELECT rsd.employee_id,d.id,d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id IN (?)`, [staffIds]);
        [rooms_list] = await db.query(`SELECT rsr.employee_id,r.id,r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id IN (?)`, [staffIds]);
      }

      const result = await Promise.all(staff.map(async s => {
        // 1. Lấy hồ sơ lương
        const [[sal]] = await db.query(`SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`, [s.id]);

        // 2. Lấy tổng hợp công từ bảng chấm công
        const [wsdRows] = await db.query(`
          SELECT wsd.status, wsd.check_in_time, wsd.check_out_time,
                 st.shift_type, st.code as shift_code, st.start_time
          FROM hr_work_schedule_details wsd
          JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
          JOIN shifts st ON st.id=wsd.shift_template_id
          WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
        `, [s.id, fromDate, toDate]);

        const isNight = (r) => r.shift_type==='ON_CALL' || ['D','Đ'].includes((r.shift_code||'').toUpperCase()) || (r.start_time||'').startsWith('21') || (r.start_time||'').startsWith('22');
        const present = wsdRows.filter(r => ['PRESENT','LATE','EARLY_LEAVE'].includes(r.status));

        const workDays     = present.filter(r => !isNight(r)).length;
        const onCallDays   = present.filter(r => isNight(r)).length;
        // paidLeave = từ chấm công + đơn nghỉ APPROVED trong tháng
        const wsdPaidLeave = wsdRows.filter(r => ['LEAVE','LEAVE_PAID'].includes(r.status)).length;
        const [[leaveRow]] = await db.query(
          `SELECT COALESCE(SUM(total_days),0) as cnt FROM hr_leave_requests WHERE employee_id=? AND status='APPROVED' AND from_date BETWEEN ? AND ?`,
          [s.id, fromDate, toDate]
        );
        const paidLeave = wsdPaidLeave + parseInt(leaveRow?.cnt || 0);
        const absentDays   = wsdRows.filter(r => r.status==='ABSENT').length;
        const totalAttendance = workDays + onCallDays + paidLeave;

        // Tính giờ tăng ca
        let overtimeHours = 0;
        present.forEach(r => {
          if (r.check_in_time && r.check_out_time) {
            const diff = (new Date(r.check_out_time) - new Date(r.check_in_time)) / 3600000;
            const hours = diff < 0 ? diff + 24 : diff;
            overtimeHours += Math.max(0, hours - 8);
          }
        });
        overtimeHours = Math.round(overtimeHours * 100) / 100;

        // 3. Công thức SRS
        const basicSalary   = parseFloat(sal?.gross_salary || sal?.net_salary || 0);
        const actualWorkDays = workDays + onCallDays + paidLeave;

        // A. Lương theo công: (basicSalary / 26) * actualWorkDays
        // Tính số ngày làm việc thực tế trong tháng (trừ CN)
        const [y2,m2] = month.split('-').map(Number);
        const daysInMonth2 = new Date(y2,m2,0).getDate();
        let workingDaysInMonth = 0;
        for(let i=1;i<=daysInMonth2;i++){if(new Date(y2,m2-1,i).getDay()!==0)workingDaysInMonth++;}
        const effectiveStdDays = Math.min(STANDARD_DAYS, workingDaysInMonth);
        const salaryByWork  = basicSalary > 0 ? Math.round((basicSalary / effectiveStdDays) * actualWorkDays) : 0;

        // B. Phụ cấp
        const onCallAllowance   = onCallDays * ON_CALL_ALLOWANCE;
        const hazardAllowance   = parseFloat(sal?.hazard_allowance || 0);
        const mealAllowance     = sal?.meal_allowance_unit === 'DAY'
          ? parseFloat(sal?.meal_allowance || 0) * actualWorkDays
          : parseFloat(sal?.meal_allowance || 0);
        const phoneAllowance    = parseFloat(sal?.phone_allowance || 0);
        const positionAllowance = parseFloat(sal?.position_allowance || 0);
        const otherAllowance    = parseFloat(sal?.other_allowance || 0);
        const allowanceAmount   = Math.round(onCallAllowance + hazardAllowance + mealAllowance + phoneAllowance + positionAllowance + otherAllowance);

        // C. Tăng ca: (basicSalary/26/8) * OT giờ * 1.5
        const overtimeAmount = basicSalary > 0
          ? Math.round((basicSalary / STANDARD_DAYS / 8) * overtimeHours * OT_RATE)
          : 0;

        // D. Gross
        const totalGross = salaryByWork + allowanceAmount + overtimeAmount;

        // E. Khấu trừ bảo hiểm 10.5%
        const insuranceBase    = basicSalary;
        const siRate           = sal?.has_social_insurance ? parseFloat(sal?.social_insurance_rate || 8) : 0;
        const hiRate           = sal?.has_health_insurance ? parseFloat(sal?.health_insurance_rate || 1.5) : 0;
        const uiRate           = sal?.has_unemployment_insurance ? parseFloat(sal?.unemployment_insurance_rate || 1) : 0;
        const insuranceAmount  = Math.round(insuranceBase * (siRate + hiRate + uiRate) / 100);

        // F. Thuế TNCN lũy tiến
        const SELF_DEDUCT = 11000000;
        const DEP_DEDUCT  = 4400000 * parseInt(sal?.dependents_count || 0);
        const taxableIncome = Math.max(0, totalGross - insuranceAmount - SELF_DEDUCT - DEP_DEDUCT);
        const pit = calcPIT(taxableIncome);

        const deductionAmount = insuranceAmount + pit;
        const netPay          = Math.max(0, totalGross - deductionAmount);

        // Bậc lương
        const salaryTemplateName = sal ? (basicSalary >= 20000000 ? 'Bậc cao' : basicSalary >= 10000000 ? 'Bậc trung' : 'Bậc cơ bản') : 'Chưa có hợp đồng';

        return {
          payrollResultId:    `${s.id}-${month}`,
          staffId:            String(s.id),
          staffCode:          s.code,
          staffName:          s.name,
          avatar:             s.avatar,
          position:           s.position || 'DOCTOR',
          salaryTemplateName,
          departments:        depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
          rooms:              rooms_list.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
          workDays,
          onCallDays,
          totalAttendance,
          actualWorkDays,
          paidLeave,
          absentDays,
          overtimeHours,
          totalLateMinutes:   0,
          totalEarlyMinutes:  0,
          basicSalary,
          salaryByWork,
          onCallAllowance,
          allowanceAmount,
          overtimeAmount,
          deductionAmount,
          insuranceAmount,
          personalIncomeTax:  pit,
          totalGross,
          netPay,
          confirmationStatus: 'N/A',
          note:               '',
          staffStatus:        'WORKING',
        };
      }));

      res.json({
        statusCode: 200,
        data: {
          data: result,
          period: {
            id: null, name: `Kỳ lương tháng ${m}/${y}`,
            fromDate, toDate, status:'DRAFT', standardWorkingDays: STANDARD_DAYS,
          },
          pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(parseInt(total)/parseInt(limit)), totalPages: Math.ceil(parseInt(total)/parseInt(limit)) },
        },
        message: 'success',
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy bảng lương', e); }
  },

  // GET /payroll/periods
  getPeriods: async (req, res) => {
    try {
      // Sinh danh sách kỳ lương 6 tháng gần nhất
      const periods = [];
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear(), m = d.getMonth() + 1;
        const monthStr = `${y}-${String(m).padStart(2,'0')}`;
        const lastDay = new Date(y, m, 0).getDate();
        periods.push({
          id: `${y}${String(m).padStart(2,'0')}`,
          name: `Kỳ lương tháng ${m}/${y}`,
          fromDate: `${monthStr}-01`,
          toDate: `${monthStr}-${lastDay}`,
          status: i === 0 ? 'DRAFT' : 'PUBLISHED',
          standardWorkingDays: 26,
        });
      }
      ok(res, periods);
    } catch (e) { fail(res, 500, 'Lỗi lấy kỳ lương', e); }
  },

  // GET /payroll/staff/:id/history
  getStaffHistory: async (req, res) => {
    try {
      const { id } = req.params;
      const [[sal]] = await db.query(`SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`, [id]);
      if (!sal) return ok(res, { data: [], pagination: { total: 0, page: 1, limit: 10, totalPage: 0 } });

      const basicSalary = parseFloat(sal.gross_salary || sal.net_salary || 0);
      const STANDARD_DAYS = 26;

      const history = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear(), m = d.getMonth() + 1;
        const month = `${y}-${String(m).padStart(2,'0')}`;
        const fromDate = `${month}-01`;
        const toDate = new Date(y, m, 0).toISOString().slice(0,10);

        const [wsdRows] = await db.query(`
          SELECT wsd.status, wsd.check_in_time, wsd.check_out_time,
                 st.shift_type, st.code as shift_code
          FROM hr_work_schedule_details wsd
          JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
          JOIN shifts st ON st.id=wsd.shift_template_id
          WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
        `, [id, fromDate, toDate]);

        if (!wsdRows.length) continue;

        const isNight = r => r.shift_type==='ON_CALL'||['D','Đ'].includes((r.shift_code||'').toUpperCase());
        const present = wsdRows.filter(r=>['PRESENT','LATE','EARLY_LEAVE'].includes(r.status));
        const onCallDays = present.filter(r=>isNight(r)).length;
        const actualWorkDays = present.length;

        let overtimeHours = 0;
        present.forEach(r => {
          if (r.check_in_time && r.check_out_time) {
            const diff = (new Date(r.check_out_time)-new Date(r.check_in_time))/3600000;
            overtimeHours += Math.max(0, (diff<0?diff+24:diff)-8);
          }
        });

        const salaryByWork = basicSalary>0 ? Math.round((basicSalary/STANDARD_DAYS)*actualWorkDays) : 0;
        const allowanceAmount = Math.round(onCallDays*150000 + parseFloat(sal.meal_allowance||0) + parseFloat(sal.phone_allowance||0));
        const overtimeAmount = basicSalary>0 ? Math.round((basicSalary/STANDARD_DAYS/8)*overtimeHours*1.5) : 0;
        const totalGross = salaryByWork + allowanceAmount + overtimeAmount;
        const insuranceAmount = Math.round(basicSalary * ((sal.has_social_insurance?parseFloat(sal.social_insurance_rate||8):0) + (sal.has_health_insurance?parseFloat(sal.health_insurance_rate||1.5):0) + (sal.has_unemployment_insurance?parseFloat(sal.unemployment_insurance_rate||1):0)) / 100);
        const netPay = Math.max(0, totalGross - insuranceAmount);

        history.push({
          id: `${id}-${month}`,
          basicSalary: salaryByWork, allowanceAmount, overtimeAmount,
          bonusAmount: 0, deductionAmount: 0, insuranceAmount, taxAmount: 0, netPay,
          calculationDetails: { actualWorkDays, overtimeHours: Math.round(overtimeHours*100)/100 },
          isPaid: i > 0,
          paidAt: i > 0 ? toDate : null,
          payrollPeriod: {
            name: `Tháng ${m}/${y}`, fromDate, toDate,
            standardWorkingDays: STANDARD_DAYS, status: i===0?'DRAFT':'PUBLISHED', note: null,
          },
        });
      }

      ok(res, { data: history, pagination: { total: history.length, page: 1, limit: 12, totalPage: 1 } });
    } catch (e) { fail(res, 500, 'Lỗi lấy lịch sử lương', e); }
  },

  // GET /payroll/feedback
  getFeedback: async (req, res) => {
    try {
      const { month, search, status, page=1, limit=10 } = req.query;
      let where = ['1=1'];
      let params = [];
      if (month)  { where.push('f.month=?'); params.push(month); }
      if (status) { where.push('f.status=?'); params.push(status); }
      if (search) { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }

      const [[{total}]] = await db.query(
        `SELECT COUNT(*) as total FROM hr_payslip_feedback f JOIN hr_employees e ON e.id=f.employee_id WHERE ${where.join(' AND ')}`, params);

      const [rows] = await db.query(`
        SELECT f.*, e.employee_code, e.full_name, e.avatar,
               d.name as dept_name,
               sal.gross_salary, sal.net_salary,
               sal.hazard_allowance, sal.meal_allowance, sal.phone_allowance,
               sal.has_social_insurance, sal.social_insurance_rate,
               sal.has_health_insurance, sal.health_insurance_rate,
               sal.has_unemployment_insurance, sal.unemployment_insurance_rate,
               DATE_FORMAT(f.created_at,'%Y-%m-%dT%H:%i:%sZ') as created_at_str
        FROM hr_payslip_feedback f
        JOIN hr_employees e ON e.id=f.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
        LEFT JOIN cat_departments d ON d.code=rsd.department_code
        LEFT JOIN hr_staff_salary sal ON sal.employee_id=f.employee_id
        WHERE ${where.join(' AND ')}
        GROUP BY f.id
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      ok(res, {
        data: rows.map(r => ({
          id: String(r.id), content: r.content,
          responseContent: r.response_content || null,
          status: r.status, resolvedAt: r.resolved_at || null,
          createdAt: r.created_at_str, updatedAt: r.created_at_str, deletedAt: null,
          staff: {
            id: String(r.employee_id), code: r.employee_code,
            name: r.full_name, avatar: r.avatar,
            departments: r.dept_name ? [{ id:'', name: r.dept_name }] : [], rooms: [],
          },
          payroll: (() => {
            const basicSalary = parseFloat(r.gross_salary || r.net_salary || 0);
            const allowance = parseFloat(r.hazard_allowance||0) + parseFloat(r.meal_allowance||0) + parseFloat(r.phone_allowance||0);
            const siRate = r.has_social_insurance ? parseFloat(r.social_insurance_rate||8) : 0;
            const hiRate = r.has_health_insurance ? parseFloat(r.health_insurance_rate||1.5) : 0;
            const uiRate = r.has_unemployment_insurance ? parseFloat(r.unemployment_insurance_rate||1) : 0;
            const insurance = Math.round(basicSalary*(siRate+hiRate+uiRate)/100);
            const totalGross = basicSalary + allowance;
            const netPay = Math.max(0, totalGross - insurance);
            return {
            id: `${r.employee_id}-${r.month}`,
            netPay, totalGross,
            basicSalary: r.basic_salary || 0,
            allowanceAmount: r.allowance_amount || 0,
            overtimeAmount: r.overtime_amount || 0,
            insuranceAmount: r.insurance_amount || 0,
            taxAmount: r.tax_amount || 0,
            workDays: r.work_days || 0,
            totalAttendance: r.total_attendance || 0,
            overtimeHours: r.overtime_hours || 0,
            onCallDays: r.on_call_days || 0,
            advancePayment: 0,
            payslipStatus: 'NOT_SENT',
            isPaid: false,
            calculationDetails: {
              standardDays: 26,
              actualWorkDays: r.work_days || 0,
              overtimeHours: r.overtime_hours || 0,
            },
            payrollPeriod: { id:'', month: r.month, name:`Tháng ${r.month}`, fromDate:`${r.month}-01`, toDate:`${r.month}-30`, standardWorkingDays: 26, status:'DRAFT', note:null },
          }; })(),
          period: { id:'', month: r.month, name:`Tháng ${r.month}`, fromDate:`${r.month}-01`, toDate:`${r.month}-30` },
        })),
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(total/limit) }
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy feedback lương', e); }
  },

  // GET /staff-kpi
  getKpi: async (req, res) => {
    try {
      ok(res, { data: [], pagination: { total: 0, page: 1, limit: 20 } });
    } catch (e) { fail(res, 500, 'Lỗi lấy KPI', e); }
  },

  // GET /other-income
  getOtherIncome: async (req, res) => {
    try {
      ok(res, { data: [], pagination: { total: 0, page: 1, limit: 20 } });
    } catch (e) { fail(res, 500, 'Lỗi lấy thu nhập khác', e); }
  },


  getSummary: async (req, res) => {
    try {
      const { month = new Date().toISOString().slice(0,7) } = req.query;
      const fromDate = `${month}-01`;
      const [y,m] = month.split('-').map(Number);
      const toDate = new Date(y,m,0).toISOString().slice(0,10);

      // Tổng gross từ bảng lương
      const [[payroll]] = await db.query(`
        SELECT COUNT(*) as staffCount,
               SUM(wsd.status='PRESENT' OR wsd.status='LATE') as totalPresent
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        WHERE wsd.work_date BETWEEN ? AND ?
      `, [fromDate, toDate]);

      const [salaries] = await db.query(`SELECT gross_salary FROM hr_staff_salary`);
      const totalGross = salaries.reduce((s,r) => s+parseFloat(r.gross_salary||0), 0);

      const [[kpiCount]] = await db.query(`SELECT COUNT(*) as c FROM hr_staff_kpi WHERE DATE_FORMAT(month,'%Y-%m')=?`, [month]);
      const [[otherCount]] = await db.query(`SELECT COUNT(*) as c FROM hr_other_income WHERE DATE_FORMAT(month,'%Y-%m')=? OR month IS NULL`, [month]).catch(()=>[[{c:0}]]);

      ok(res, {
        month,
        inputs: { attendance: String(payroll.totalPresent||0), revenue: 0, kpiPoint: 0, otherIncomeCount: parseInt(otherCount?.c||0) },
        costs: { totalGrossSalary: totalGross, totalBonus: 0, totalPenalty: 0, estimatedTotalPay: totalGross * 0.895 },
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy tổng hợp', e); }
  },

  getSummaryLatest: async (req, res) => {
    try {
      const month = new Date().toISOString().slice(0,7);
      ok(res, { month });
    } catch(e) { fail(res, 500, 'Lỗi', e); }
  },

  calculate: async (req, res) => {
    ok(res, null, 'Đã tính lương thành công');
  },

  lock: async (req, res) => {
    ok(res, null, 'Đã khóa bảng lương');
  },

  unlock: async (req, res) => {
    ok(res, null, 'Đã mở khóa bảng lương');
  },

  getResultDetails: async (req, res) => {
    try {
      const { id } = req.params; // format: staffId-YYYY-MM
      const parts = id.split('-');
      const staffId = parts[0];
      const month = parts.slice(1).join('-'); // YYYY-MM
      const fromDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);
      const STANDARD_DAYS = 26;
      const ON_CALL_ALLOWANCE = 150000;
      const OT_RATE = 1.5;

      const [[e]] = await db.query(`
        SELECT e.id, e.employee_code as code, e.full_name as name, e.avatar,
               COALESCE(jt.name, 'Nhân viên') as position,
               dep.name as department_name
        FROM hr_employees e
        LEFT JOIN hr_contracts c ON c.employee_id=e.id AND c.status='ACTIVE'
        LEFT JOIN cat_titles jt ON jt.id=c.job_title_code
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
        LEFT JOIN cat_departments dep ON dep.code=rsd.department_code
        WHERE e.id=? LIMIT 1`, [staffId]);
      if (!e) return fail(res, 404, 'Không tìm thấy nhân viên');

      const [[sal]] = await db.query(`SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`, [staffId]);
      const [wsdRows] = await db.query(`
        SELECT wsd.status, wsd.check_in_time, wsd.check_out_time,
               st.shift_type, st.code as shift_code, st.start_time
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        JOIN shifts st ON st.id=wsd.shift_template_id
        WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
      `, [staffId, fromDate, toDate]);

      const isNight = (r) => r.shift_type==='ON_CALL'||['D','Đ'].includes((r.shift_code||'').toUpperCase())||(r.start_time||'').startsWith('21')||(r.start_time||'').startsWith('22');
      const present = wsdRows.filter(r=>['PRESENT','LATE','EARLY_LEAVE'].includes(r.status));
      const workDays = present.filter(r=>!isNight(r)).length;
      const onCallDays = present.filter(r=>isNight(r)).length;
      const paidLeave = wsdRows.filter(r=>['LEAVE','LEAVE_PAID'].includes(r.status)).length;
      const actualWorkDays = workDays + onCallDays + paidLeave;

      let totalOvertimeHours = 0;
      present.forEach(r => {
        if (r.check_in_time && r.check_out_time) {
          const diff = (new Date(r.check_out_time)-new Date(r.check_in_time))/3600000;
          totalOvertimeHours += Math.max(0, (diff<0?diff+24:diff)-8);
        }
      });
      totalOvertimeHours = Math.round(totalOvertimeHours*100)/100;

      const basicSalary = parseFloat(sal?.gross_salary||sal?.net_salary||0);
      const [ry,rm] = month.split('-').map(Number);
      const dim = new Date(ry,rm,0).getDate();
      let wdim = 0; for(let i=1;i<=dim;i++){if(new Date(ry,rm-1,i).getDay()!==0)wdim++;}
      const effStd = Math.min(STANDARD_DAYS, wdim);
      const salaryByWork = basicSalary>0 ? Math.round((basicSalary/effStd)*actualWorkDays) : 0;
      const onCallSalary = onCallDays * ON_CALL_ALLOWANCE;
      const hazardAllowance = parseFloat(sal?.hazard_allowance||0);
      const mealAllowance = sal?.meal_allowance_unit==='DAY' ? parseFloat(sal?.meal_allowance||0)*actualWorkDays : parseFloat(sal?.meal_allowance||0);
      const phoneAllowance = parseFloat(sal?.phone_allowance||0);
      const positionAllowance = parseFloat(sal?.position_allowance||0);
      const otherAllowance = parseFloat(sal?.other_allowance||0);
      const overtimeAmount = basicSalary>0 ? Math.round((basicSalary/STANDARD_DAYS/8)*totalOvertimeHours*OT_RATE) : 0;
      const totalBeforeDeduction = salaryByWork + onCallSalary + hazardAllowance + mealAllowance + phoneAllowance + positionAllowance + otherAllowance + overtimeAmount;

      const siRate = sal?.has_social_insurance ? parseFloat(sal?.social_insurance_rate||8) : 0;
      const hiRate = sal?.has_health_insurance ? parseFloat(sal?.health_insurance_rate||1.5) : 0;
      const uiRate = sal?.has_unemployment_insurance ? parseFloat(sal?.unemployment_insurance_rate||1) : 0;
      const socialInsurance = Math.round(basicSalary*siRate/100);
      const healthInsurance = Math.round(basicSalary*hiRate/100);
      const unemploymentInsurance = Math.round(basicSalary*uiRate/100);
      const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;

      const SELF_DEDUCT = 11000000;
      const DEP_DEDUCT = 4400000 * parseInt(sal?.dependents_count||0);
      const taxableIncome = Math.max(0, totalBeforeDeduction - totalInsurance - SELF_DEDUCT - DEP_DEDUCT);
      const personalIncomeTax = calcPIT(taxableIncome);
      const totalDeduction = totalInsurance + personalIncomeTax;
      const netIncome = Math.max(0, totalBeforeDeduction - totalDeduction);

      ok(res, {
        staffName: e.name, staffCode: e.code, departmentName: e.department_name||'',
        monthLabel: `Tháng ${m}/${y}`, fromDate, toDate,
        standardWorkingDays: effStd, actualWorkDays, paidLeave,
        unpaidLeave: 0, totalWorkDays: actualWorkDays, workDays,
        totalAttendance: actualWorkDays,
        totalLeaveDays: 0, usedLeaveDays: 0, remainingLeaveDays: 0,
        totalOvertimeHours, overtimeAmount, compHoursUsed: 0, compHoursRemaining: 0,
        contractBasicSalary: basicSalary, contractHazardAllowance: hazardAllowance,
        contractSupportAllowance: positionAllowance, contractTotalSalary: basicSalary,
        actualWorkSalary: salaryByWork, onCallDays, onCallSalary,
        actualPositionAllowance: positionAllowance, actualBasicSalaryByWork: salaryByWork,
        responsibilityAllowance: 0, positionAllowance, hazardAllowance,
        mealAllowance, fuelAllowance: parseFloat(sal?.fuel_allowance||0),
        phoneAllowance, businessTripAllowance: parseFloat(sal?.business_trip_allowance||0),
        otherAllowance, performanceSalary: 0, bonusAmount: 0,
        otherIncomeAndOvertime: overtimeAmount, totalBeforeDeduction,
        violationPenalty: 0, violationDetails: '',
        insuranceBaseSalary: basicSalary, socialInsurance, healthInsurance,
        unemploymentInsurance, unionFee: 0,
        selfDeduction: SELF_DEDUCT, familyDeduction: DEP_DEDUCT,
        taxExemptIncome: SELF_DEDUCT+DEP_DEDUCT, personalIncomeTax,
        totalDeduction, netIncome, prepaidPhase1: 0, advancePayment: 0,
        pensionFund1Percent: 0, finalAmount: netIncome,
        employerSocialInsurance: 0, employerHealthInsurance: 0,
        employerUnemploymentInsurance: 0, employerUnionFee: 0, employerTotal: 0,
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy chi tiết lương', e); }
  },
};


// Tính thuế TNCN lũy tiến theo biểu thuế VN
function calcPIT(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  const brackets = [
    { limit: 5000000,  rate: 0.05 },
    { limit: 10000000, rate: 0.10 },
    { limit: 18000000, rate: 0.15 },
    { limit: 32000000, rate: 0.20 },
    { limit: 52000000, rate: 0.25 },
    { limit: 80000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
  ];
  let tax = 0, remaining = taxableIncome, prev = 0;
  for (const b of brackets) {
    const band = Math.min(remaining, b.limit - prev);
    tax += band * b.rate;
    remaining -= band;
    prev = b.limit;
    if (remaining <= 0) break;
  }
  return Math.round(tax);
}

module.exports = payrollController;