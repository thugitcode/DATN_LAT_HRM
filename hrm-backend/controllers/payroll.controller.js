const db = require('../config/db');
const { calcPayroll } = require('./payroll-engine');
const { sendPayslipEmail } = require('../services/email.service');
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
      const fromDate = `${month}-01`;

      const [[period]] = await db.query(`SELECT * FROM hr_payroll_periods WHERE month=?`, [month]);
      const [[{ totalStaff }]] = await db.query(`SELECT COUNT(*) as totalStaff FROM hr_employees WHERE status != 'RESIGNED'`);
      const [[{ pendingCount }]] = await db.query(`
        SELECT COUNT(*) as pendingCount FROM hr_attendance_explanations
        WHERE status IN ('PENDING','MANAGER_APPROVED') AND work_date BETWEEN ? AND ?
      `, [fromDate, toDate]);

      ok(res, {
        period: {
          id: period?.id ? String(period.id) : null,
          name: `Kỳ lương tháng ${m}/${y}`,
          fromDate, toDate,
          status: period?.status || 'DRAFT',
          standardWorkingDays: 26,
          calculatedAt: period?.calculated_at || null,
          lockedAt: period?.locked_at || null,
        },
        totalStaff: parseInt(totalStaff) || 0,
        confirmedCount: period?.total_staff || 0,
        rejectedCount: 0,
        pendingCount: parseInt(pendingCount) || 0,
        canCalculate: parseInt(pendingCount) === 0 && period?.status !== 'LOCKED',
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
        const p = await calcPayroll(s.id, month);
        const [[sal]] = await db.query(`SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`, [s.id]);
        const [[contract]] = await db.query(
          `SELECT base_salary FROM hr_contracts WHERE employee_id=? AND status='ACTIVE' LIMIT 1`, [s.id]);

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

        // Nghỉ lễ
        const holidayDays = wsdRows.filter(r => r.status === 'HOLIDAY').length;

        // Thu nhập khác của NV trong tháng
        const [[otherIncome]] = await db.query(
          `SELECT COALESCE(SUM(amount),0) as total FROM hr_other_income WHERE employee_id=? AND DATE_FORMAT(month,'%Y-%m')=?`,
          [s.id, month]
        );
        const otherIncomeAmount = parseFloat(otherIncome?.total || 0);
        const absentDays = wsdRows.filter(r => r.status==='ABSENT').length;

        // Kiểm tra vắng có giải trình APPROVED → được tính công
        // PENDING → chưa duyệt → chưa tính
        const [[approvedExpl]] = await db.query(`
          SELECT COUNT(*) as cnt FROM hr_attendance_explanations
          WHERE employee_id=? AND status='APPROVED'
          AND work_date BETWEEN ? AND ?
        `, [s.id, fromDate, toDate]);
        const approvedAbsents = parseInt(approvedExpl?.cnt || 0);
        const unpaidAbsents   = Math.max(0, absentDays - approvedAbsents);

        // LATE → vẫn tính công, chỉ trừ tiền phạt (vi phạm)
        // Tính tiền phạt muộn dựa trên số phút
        let latePenaltyAmount = 0;
        const lateRows = wsdRows.filter(r => r.status === 'LATE');
        for (const lr of lateRows) {
          if (!lr.check_in_time || !lr.start_time) continue;
          const actualIn = new Date(lr.check_in_time);
          const [sh, sm] = lr.start_time.split(':').map(Number);
          const scheduled = new Date(actualIn);
          scheduled.setUTCHours(sh - 7, sm, 0);
          const lateMinutes = (actualIn - scheduled) / 60000;
          // Phạt theo phút muộn: 50,000đ/30p muộn
          if (lateMinutes > 15) latePenaltyAmount += Math.ceil(lateMinutes / 30) * 50000;
        }

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
        const basicSalary   = parseFloat(contract?.base_salary || sal?.gross_salary || sal?.net_salary || 0);
        // LATE vẫn tính công đầy đủ
        // Chỉ ABSENT không có giải trình APPROVED mới không tính công
        const actualWorkDays = workDays + onCallDays + paidLeave + holidayDays - unpaidAbsents;

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

        // Phạt vi phạm (đi muộn)
        const violationPenalty = latePenaltyAmount || 0;
        const deductionAmount = insuranceAmount + pit + violationPenalty;
        const netPay          = Math.max(0, totalGross - deductionAmount);

        // Bậc lương
        const salaryTemplateName = sal ? (basicSalary >= 20000000 ? 'Bậc cao' : basicSalary >= 10000000 ? 'Bậc trung' : 'Bậc cơ bản') : 'Chưa có hợp đồng';

        return {
          payrollResultId:    `${s.id}-${month}`,
          staffId:            String(s.id),
          staffCode:          s.code,
          staffName:          s.name,
          avatar:             s.avatar,
          position:           s.position || 'Nhân viên',
          salaryTemplateName: sal ? (p.baseSalary >= 20000000 ? 'Bậc cao' : p.baseSalary >= 10000000 ? 'Bậc trung' : 'Bậc cơ bản') : 'Chưa có hợp đồng',
          departments:        depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
          rooms:              rooms_list.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
          workDays:           p.workDays,
          onCallDays:         p.onCallDays,
          holidayDays:        p.holidayDays,
          compRestDays:       p.compRestDays,
          totalAttendance:    p.totalWorkDays,
          actualWorkDays:     p.totalWorkDays,
          paidLeave:          p.paidLeave,
          absentDays:         p.absentDays,
          overtimeHours:      p.overtimeHours,
          totalLateMinutes:   0,
          totalEarlyMinutes:  0,
          basicSalary:        p.baseSalary,
          salaryByWork:       p.salaryByWork,
          onCallAllowance:    p.onCallSalary,
          allowanceAmount:    p.totalAllowance,
          overtimeAmount:     p.overtimeAmount,
          otherIncomeAmount:  p.otherIncomeAmount,
          kpiScore:           p.kpiScore,
          revenueRate:        p.revenueRate,
          bonusAmount:        p.revenueBonus + p.kpiBonus,
          deductionAmount:    p.totalDeduction,
          insuranceAmount:    p.totalIns,
          personalIncomeTax:  p.pit,
          violationPenalty:   p.violationPenalty,
          totalGross:         p.totalGross,
          netPay:             p.netIncome,
          confirmationStatus: 'N/A',
          note:               '',
          staffStatus:        s.status || 'WORKING',
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

        // Dùng calcPayroll cho số liệu chính xác
        const p = await calcPayroll(id, month);
        const salaryByWork = p.salaryByWork;
        const allowanceAmount = p.totalAllowance;
        const overtimeAmount = p.overtimeAmount;
        const totalGross = p.totalGross;
        const insuranceAmount = p.totalIns;
        const netPay = p.netIncome;

        history.push({
          id: `${id}-${month}`,
          basicSalary: salaryByWork, allowanceAmount, overtimeAmount,
          bonusAmount: p.kpiBonus + p.revenueBonus, deductionAmount: p.totalDeduction, insuranceAmount, taxAmount: p.pit, netPay,
          calculationDetails: { actualWorkDays: p.totalWorkDays, overtimeHours: p.overtimeHours },
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
      const { month, search, status, employeeId, page=1, limit=10 } = req.query;
      let where = ['1=1'];
      let params = [];
      if (employeeId) { where.push('f.employee_id=?'); params.push(employeeId); }
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

      const [[kpiData]] = await db.query(`SELECT COUNT(*) as c, AVG(kpi_score) as avg_score FROM hr_staff_kpi WHERE DATE_FORMAT(month,'%Y-%m')=?`, [month]);
      const [[otherCount]] = await db.query(`SELECT COUNT(*) as c, SUM(amount) as total FROM hr_other_income WHERE DATE_FORMAT(month,'%Y-%m')=?`, [month]).catch(()=>[[{c:0,total:0}]]);
      const [[revenueData]] = await db.query(`SELECT COUNT(*) as c, SUM(actual_amount) as total FROM hr_staff_revenue WHERE DATE_FORMAT(month,'%Y-%m')=? AND status='CONFIRMED'`, [month]).catch(()=>[[{c:0,total:0}]]);

      const totalOtherIncome = parseFloat(otherCount?.total||0);
      const totalRevenue = parseFloat(revenueData?.total||0);
      const avgKpi = parseFloat(kpiData?.avg_score||0);
      const totalBonus = totalOtherIncome;
      const estimatedPay = (totalGross + totalBonus) * 0.895;

      ok(res, {
        month,
        inputs: {
          attendance: String(payroll.totalPresent||0),
          revenue: totalRevenue,
          kpiPoint: Math.round(avgKpi * 100) / 100,
          otherIncomeCount: parseInt(otherCount?.c||0),
          otherIncomeTotal: totalOtherIncome,
        },
        costs: { totalGrossSalary: totalGross, totalBonus, totalPenalty: 0, estimatedTotalPay: estimatedPay },
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
    try {
      const { month } = req.body || req.query;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`;
      const [y, m] = currentMonth.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);

      // Kiểm tra còn đơn giải trình PENDING không
      const [[pending]] = await db.query(`
        SELECT COUNT(*) as cnt FROM hr_attendance_explanations
        WHERE status IN ('PENDING','MANAGER_APPROVED')
        AND work_date BETWEEN ? AND ?
      `, [fromDate, toDate]);

      if (parseInt(pending?.cnt || 0) > 0) {
        return res.status(400).json({
          statusCode: 400,
          message: `⚠️ Không thể tính lương! Còn ${pending.cnt} đơn giải trình chưa được duyệt. Vui lòng duyệt hoặc từ chối hết trước khi chốt lương.`,
          pendingCount: parseInt(pending.cnt),
        });
      }

      // Chặn tính lại nếu kỳ đã LOCKED (phải unlock trước)
      const [[existingPeriod]] = await db.query(`SELECT status FROM hr_payroll_periods WHERE month=?`, [currentMonth]);
      if (existingPeriod?.status === 'LOCKED') {
        return res.status(400).json({ statusCode: 400, message: '⚠️ Kỳ lương này đã bị khóa. Vui lòng mở khóa trước khi tính lại.' });
      }

      // Tính lương THẬT cho từng nhân viên đang làm việc, lưu snapshot vào hr_payroll_results
      const [staffList] = await db.query(`SELECT id FROM hr_employees WHERE status != 'RESIGNED'`);
      const now = new Date();
      let calculated = 0;

      for (const s of staffList) {
        try {
          const result = await calcPayroll(s.id, currentMonth);
          await db.query(
            `INSERT INTO hr_payroll_results
               (period_month, employee_id, total_gross, total_deduction, net_income,
                insurance_amount, personal_income_tax, standard_days, actual_work_days, overtime_hours,
                result_json, calculated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())
             ON DUPLICATE KEY UPDATE
               total_gross=VALUES(total_gross), total_deduction=VALUES(total_deduction),
               net_income=VALUES(net_income), insurance_amount=VALUES(insurance_amount),
               personal_income_tax=VALUES(personal_income_tax), standard_days=VALUES(standard_days),
               actual_work_days=VALUES(actual_work_days), overtime_hours=VALUES(overtime_hours),
               result_json=VALUES(result_json), calculated_at=NOW()`,
            [
              currentMonth, s.id,
              result.totalGross || 0, result.totalDeduction || 0, result.netIncome || 0,
              result.totalIns || 0, result.pit || 0,
              result.standardWorkingDays || 26, result.totalWorkDays || 0, result.overtimeHours || 0,
              JSON.stringify(result),
            ]
          );
          calculated++;
        } catch (e) {
          console.error(`[calculate] Lỗi tính lương nhân viên ${s.id}:`, e.message);
        }
      }

      // Upsert trạng thái kỳ lương
      await db.query(
        `INSERT INTO hr_payroll_periods (month, status, total_staff, calculated_at)
         VALUES (?, 'CALCULATED', ?, NOW())
         ON DUPLICATE KEY UPDATE status='CALCULATED', total_staff=VALUES(total_staff), calculated_at=NOW()`,
        [currentMonth, calculated]
      );

      ok(res, { calculated, total: staffList.length }, `Đã tính lương thành công cho ${calculated}/${staffList.length} nhân viên`);
    } catch(e) { fail(res, 500, 'Lỗi tính lương', e); }
  },

  lock: async (req, res) => {
    try {
      const { month } = req.body || req.query;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`;
      const [y, m] = currentMonth.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);

      // Hard constraint: không chốt khi còn PENDING
      const [[pending]] = await db.query(`
        SELECT COUNT(*) as cnt FROM hr_attendance_explanations
        WHERE status IN ('PENDING','MANAGER_APPROVED')
        AND work_date BETWEEN ? AND ?
      `, [fromDate, toDate]);

      if (parseInt(pending?.cnt || 0) > 0) {
        return res.status(400).json({
          statusCode: 400,
          message: `⚠️ Không thể chốt lương! Còn ${pending.cnt} đơn giải trình chưa xử lý.`,
          pendingCount: parseInt(pending.cnt),
        });
      }

      // Bắt buộc phải TÍNH LƯƠNG (CALCULATED) trước mới được khóa
      const [[period]] = await db.query(`SELECT status FROM hr_payroll_periods WHERE month=?`, [currentMonth]);
      if (!period || period.status === 'DRAFT') {
        return res.status(400).json({ statusCode: 400, message: '⚠️ Chưa tính lương cho kỳ này. Vui lòng bấm "Tính lương" trước khi chốt.' });
      }

      await db.query(
        `UPDATE hr_payroll_periods SET status='LOCKED', locked_at=NOW() WHERE month=?`,
        [currentMonth]
      );

      ok(res, null, 'Đã khóa bảng lương');
    } catch(e) { fail(res, 500, 'Lỗi khóa bảng lương', e); }
  },

  sendPayslip: async (req, res) => {
    try {
      const { staffIds, month } = req.body;
      if (!month) return fail(res, 400, 'Thiếu tháng lương');

      const ids = staffIds && staffIds.length > 0 ? staffIds : null;
      let query = `SELECT e.id, e.full_name, e.email FROM hr_employees e WHERE e.status NOT IN ('RESIGNED','TERMINATED')`;
      const params = [];
      if (ids) { query += ` AND e.id IN (?)`;  params.push(ids); }

      const [staffList] = await db.query(query, params);
      const results = [];

      for (const staff of staffList) {
        if (!staff.email) {
          results.push({ staffId: staff.id, name: staff.full_name, status: 'skip', reason: 'Không có email' });
          continue;
        }
        try {
          const p = await calcPayroll(staff.id, month);
          await sendPayslipEmail({
            to: staff.email,
            staffName: staff.full_name,
            month,
            data: {
              ...p,
              socialInsurance: p.socialIns,
              healthInsurance: p.healthIns,
              unemploymentInsurance: p.unemployIns,
              personalIncomeTax: p.pit,
            }
          });
          results.push({ staffId: staff.id, name: staff.full_name, email: staff.email, status: 'sent' });
        } catch(e) {
          results.push({ staffId: staff.id, name: staff.full_name, status: 'error', reason: e.message });
        }
      }

      const sent = results.filter(r => r.status === 'sent').length;
      ok(res, { results, sent, total: staffList.length }, `Đã gửi ${sent}/${staffList.length} phiếu lương`);
    } catch(e) { fail(res, 500, 'Lỗi gửi phiếu lương', e); }
  },

  unlock: async (req, res) => {
    try {
      const { month } = req.body || req.query;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      await db.query(
        `UPDATE hr_payroll_periods SET status='CALCULATED' WHERE month=? AND status='LOCKED'`,
        [currentMonth]
      );
      ok(res, null, 'Đã mở khóa bảng lương');
    } catch(e) { fail(res, 500, 'Lỗi mở khóa bảng lương', e); }
  },

  getResultDetails: async (req, res) => {
    try {
      const { id } = req.params; // format: staffId-YYYY-MM
      const parts = id.split('-');
      const staffId = parts[0];
      const month = parts.slice(1).join('-'); // YYYY-MM
      const [y, m] = month.split('-').map(Number);
      const fromDate = `${month}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const toDate = `${month}-${String(lastDay).padStart(2,'0')}`;

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

      // Ưu tiên đọc snapshot đã lưu (nếu kỳ này đã bấm "Tính lương" rồi) — không tính lại từ đầu nữa,
      // để đúng số đã chốt, tránh bị đổi ngầm nếu dữ liệu chấm công/cấu hình lương thay đổi sau đó.
      let p;
      const [[snapshot]] = await db.query(
        `SELECT result_json FROM hr_payroll_results WHERE employee_id=? AND period_month=?`,
        [staffId, month]
      );
      if (snapshot?.result_json) {
        p = JSON.parse(snapshot.result_json);
      } else {
        // Chưa tính lương chính thức cho kỳ này — tính tạm để xem trước (preview), không lưu lại
        p = await calcPayroll(staffId, month);
      }

      ok(res, {
        staffName: e.name, staffCode: e.code, departmentName: e.department_name||'',
        monthLabel: `Tháng ${m}/${y}`, fromDate, toDate,
        // Công
        standardWorkingDays: p.standardWorkingDays,
        actualWorkDays: p.totalWorkDays,
        workDays: p.standardWorkingDays,   // FE dùng workDays cho "Ngày công chuẩn" → phải là 26
        onCallDays: p.onCallDays,
        holidayDays: p.holidayDays,
        compRestDays: p.compRestDays,
        paidLeave: p.paidLeave,
        unpaidLeave: p.unpaidAbsents,
        totalWorkDays: p.totalWorkDays,
        totalAttendance: p.totalWorkDays,  // FE dùng totalAttendance cho "Ngày công thực tế" → phải là 19
        totalLeaveDays: p.paidLeave,
        usedLeaveDays: p.paidLeave,
        remainingLeaveDays: 12 - p.paidLeave,
        totalOvertimeHours: p.overtimeHours,
        compHoursUsed: 0, compHoursRemaining: 0,
        // Công thức thật của từng dòng — lấy từ formulas (mẫu bảng lương) hoặc mô tả fallback,
        // hiện lên "Chi tiết lương" thay cho chữ tĩnh "Công thức" trước đây.
        formulas: p.formulas || {},
        // Thu nhập
        contractBasicSalary: p.baseSalary,
        contractHazardAllowance: p.hazardAllowance,
        contractSupportAllowance: p.positionAllowance,
        contractTotalSalary: p.baseSalary,
        actualWorkSalary: p.salaryByWork,
        actualWorkSalaryFormula: p.formulas?.LUONG_THEO_CONG || '',
        actualBasicSalaryByWork: p.salaryByWork,
        onCallSalary: p.onCallSalary,
        onCallSalaryFormula: p.formulas?.PHU_CAP_TRUC || '',
        overtimeAmount: p.overtimeAmount,
        overtimeAmountFormula: p.formulas?.LUONG_TANG_CA || '',
        responsibilityAllowance: p.responsibilityAllowance || 0,
        positionAllowance: p.positionAllowance,
        hazardAllowance: p.hazardAllowance,
        mealAllowance: p.mealAllowance,
        fuelAllowance: p.fuelAllowance,
        phoneAllowance: p.phoneAllowance,
        businessTripAllowance: p.bizTripAllowance,
        otherAllowance: p.otherAllowance,
        // Thu nhập ngoài
        performanceSalary: p.kpiBonus,
        performanceSalaryFormula: p.formulas?.THUONG_KPI || '',
        bonusAmount: p.revenueBonus,
        bonusAmountFormula: p.formulas?.THUONG_DOANH_SO || '',
        holidayWorkBonus: p.holidayWorkBonus || 0,
        otherIncomeAndOvertime: p.otherIncomeAmount,
        otherIncomeAmount: p.otherIncomeAmount,
        kpiScore: p.kpiScore,
        revenueRate: p.revenueRate,
        // Tổng
        totalBeforeDeduction: p.totalGross,
        // Bảo hiểm
        insuranceBaseSalary: p.insuranceBase,
        socialInsurance: p.socialIns,
        socialInsuranceFormula: p.formulas?.BHXH_NLD || '',
        healthInsurance: p.healthIns,
        healthInsuranceFormula: p.formulas?.BHYT_NLD || '',
        unemploymentInsurance: p.unemployIns,
        unemploymentInsuranceFormula: p.formulas?.BHTN_NLD || '',
        unionFee: p.unionFee,
        unionFeeFormula: p.formulas?.CONG_DOAN || '',
        selfDeduction: 11000000,
        familyDeduction: p.taxable ? (11000000 + 4400000 * 0) : 0,
        taxableIncome: p.taxable,
        personalIncomeTax: p.pit,
        personalIncomeTaxFormula: p.formulas?.THUE_TNCN || '',
        violationPenalty: p.violationPenalty,
        totalDeduction: p.totalDeduction,
        netIncome: p.netIncome,
        finalAmount: p.netIncome,           // FE dùng finalAmount cho Tổng thực nhận
        advancePayment: 0,
        // Doanh nghiệp đóng thêm
        employerSocialInsurance: Math.round(p.insuranceBase * 17.5 / 100),
        employerHealthInsurance: Math.round(p.insuranceBase * 3 / 100),
        employerUnemploymentInsurance: Math.round(p.insuranceBase * 1 / 100),
        employerUnionFee: Math.round(p.insuranceBase * 2 / 100),
        employerTotal: Math.round(p.insuranceBase * 23.5 / 100),
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết lương', e); }
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

payrollController.createFeedback = async (req, res) => {
  try {
    const { employeeId, month, content } = req.body;
    if (!employeeId || !month || !content) return fail(res, 400, 'Thiếu thông tin phản hồi');

    const [[existing]] = await db.query(
      `SELECT id FROM hr_payslip_feedback WHERE employee_id=? AND month=? LIMIT 1`,
      [employeeId, month]
    );
    if (existing) return fail(res, 400, 'Bạn đã gửi phản hồi cho tháng này rồi!');

    const [result] = await db.query(
      `INSERT INTO hr_payslip_feedback (employee_id, month, content, status, created_at) VALUES (?,?,?,'PENDING',NOW())`,
      [employeeId, month, content]
    );
    ok(res, { id: result.insertId }, 'Gửi phản hồi thành công');
  } catch(e) { fail(res, 500, 'Lỗi gửi phản hồi', e); }
};

// PATCH /payroll/feedback/:id/respond — HR trả lời thắc mắc phiếu lương của nhân viên
payrollController.respondFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseContent } = req.body;
    if (!responseContent?.trim()) return fail(res, 400, 'Vui lòng nhập nội dung trả lời');

    const [[existing]] = await db.query(`SELECT id FROM hr_payslip_feedback WHERE id=?`, [id]);
    if (!existing) return fail(res, 404, 'Không tìm thấy phản hồi này');

    // status='CONFIRMED' khớp đúng PayslipFeedbackStatus enum (PENDING|CONFIRMED|REJECTED) dùng ở FE
    await db.query(
      `UPDATE hr_payslip_feedback SET response_content=?, status='CONFIRMED', resolved_at=NOW() WHERE id=?`,
      [responseContent.trim(), id]
    );
    ok(res, null, 'Đã gửi trả lời cho nhân viên');
  } catch(e) { fail(res, 500, 'Lỗi gửi trả lời', e); }
};

module.exports = payrollController;