const db = require('../config/db');
const { calcPayroll } = require('./payroll-engine');
const { sendPayslipEmail } = require('../services/email.service');
const ok   = (res, data, msg = 'success') => res.json({ statusCode: 200, data, message: msg });
// QUAN TRỌNG: trả kèm err.message thật ra response (chỉ dùng khi làm đồ án/dev, không dùng khi lên production
// thật vì lộ chi tiết lỗi hệ thống) — để không phải đoán mò mỗi lần lỗi 500 nữa, cứ mở Network tab là thấy ngay.
const fail = (res, status, msg, err = null) => {
  if (err) console.error(`[payroll] ${msg}:`, err.message);
  return res.status(status).json({ statusCode: status, message: msg, error: err?.message || null, errorCode: err?.code || null });
};

const payrollController = {

  // GET /payroll/by-month/status?month=YYYY-MM
  getStatus: async (req, res) => {
    try {
      const { month = new Date().toISOString().slice(0, 7) } = req.query;
      const [y, m] = month.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);
      const fromDate = `${month}-01`;

      // Nếu bảng hr_payroll_periods chưa tồn tại (chưa chạy SQL tạo bảng) → coi như chưa có kỳ nào, không crash
      const [[period]] = await db.query(`SELECT * FROM hr_payroll_periods WHERE month=?`, [month]).catch(() => [[null]]);
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
      let depts = [], rooms_list = [];
      if (staffIds.length) {
        [depts] = await db.query(`SELECT rsd.employee_id,d.id,d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id IN (?)`, [staffIds]);
        [rooms_list] = await db.query(`SELECT rsr.employee_id,r.id,r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id IN (?)`, [staffIds]);
      }

      // Trước đây hàm này tự tính lại toàn bộ công thức lương (workDays, allowance, gross, insurance, pit,
      // netPay...) ngay tại đây, NHƯNG kết quả trả về cuối cùng chỉ dùng p.* (từ calcPayroll()) — toàn bộ
      // phần tự tính đó là code chết, không ảnh hưởng kết quả, chỉ tốn thêm nhiều query DB không cần thiết.
      // Đã bỏ, chỉ giữ calcPayroll() làm nguồn tính duy nhất — đảm bảo TRÙNG KHỚP với chi tiết lương.
      const result = await Promise.all(staff.map(async s => {
        const p = await calcPayroll(s.id, month);

        return {
          payrollResultId:    `${s.id}-${month}`,
          staffId:            String(s.id),
          staffCode:          s.code,
          staffName:          s.name,
          avatar:             s.avatar,
          position:           s.position || 'Nhân viên',
          salaryTemplateName: p.templateName || (p.baseSalary >= 20000000 ? 'Bậc cao' : p.baseSalary >= 10000000 ? 'Bậc trung' : 'Bậc cơ bản'),
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
          SELECT wsd.id FROM hr_work_schedule_details wsd
          JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
          WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
        `, [id, fromDate, toDate]);

        if (!wsdRows.length) continue;

        // Ưu tiên đọc snapshot đã "chốt" nếu có; nếu bảng chưa tồn tại hoặc lỗi bất kỳ, rơi về tính trực tiếp
        let p;
        const [[snapshot]] = await db.query(
          `SELECT result_json FROM hr_payroll_results WHERE employee_id=? AND period_month=?`,
          [id, month]
        ).catch(() => [[null]]);
        p = snapshot?.result_json ? JSON.parse(snapshot.result_json) : await calcPayroll(id, month);

        history.push({
          id: `${id}-${month}`,
          basicSalary: p.salaryByWork, allowanceAmount: p.totalAllowance, overtimeAmount: p.overtimeAmount,
          bonusAmount: p.kpiBonus + p.revenueBonus, deductionAmount: p.totalDeduction, insuranceAmount: p.totalIns, taxAmount: p.pit, netPay: p.netIncome,
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
            insuranceAmount: insurance,
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

      const [[existingPeriod]] = await db.query(`SELECT status FROM hr_payroll_periods WHERE month=?`, [currentMonth]).catch(() => [[null]]);
      if (existingPeriod?.status === 'LOCKED') {
        return res.status(400).json({ statusCode: 400, message: '⚠️ Kỳ lương này đã bị khóa. Vui lòng mở khóa trước khi tính lại.' });
      }

      const [staffList] = await db.query(`SELECT id FROM hr_employees WHERE status != 'RESIGNED'`);
      let calculated = 0;

      for (const s of staffList) {
        try {
          const result = await calcPayroll(s.id, currentMonth);
          await db.query(
            `INSERT INTO hr_payroll_results (period_month, employee_id, total_gross, total_deduction, net_income, result_json, calculated_at)
             VALUES (?,?,?,?,?,?,NOW())
             ON DUPLICATE KEY UPDATE
               total_gross=VALUES(total_gross), total_deduction=VALUES(total_deduction),
               net_income=VALUES(net_income), result_json=VALUES(result_json), calculated_at=NOW()`,
            [currentMonth, s.id, result.totalGross || 0, result.totalDeduction || 0, result.netIncome || 0, JSON.stringify(result)]
          );
          calculated++;
        } catch (e) {
          console.error(`[calculate] Lỗi tính lương nhân viên ${s.id}:`, e.message);
        }
      }

      await db.query(
        `INSERT INTO hr_payroll_periods (month, status, total_staff, calculated_at)
         VALUES (?, 'CALCULATED', ?, NOW())
         ON DUPLICATE KEY UPDATE status='CALCULATED', total_staff=VALUES(total_staff), calculated_at=NOW()`,
        [currentMonth, calculated]
      );

      ok(res, { calculated, total: staffList.length }, `Đã tính lương thành công cho ${calculated}/${staffList.length} nhân viên`);
    } catch(e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        return fail(res, 500, '⚠️ Chưa tạo bảng hr_payroll_periods / hr_payroll_results trong CSDL. Vui lòng chạy SQL tạo 2 bảng này trước.', e);
      }
      fail(res, 500, 'Lỗi tính lương', e);
    }
  },

  lock: async (req, res) => {
    try {
      const { month } = req.body || req.query;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`;
      const [y, m] = currentMonth.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);

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

      const [[period]] = await db.query(`SELECT status FROM hr_payroll_periods WHERE month=?`, [currentMonth]).catch(() => [[null]]);
      if (!period || period.status === 'DRAFT') {
        return res.status(400).json({ statusCode: 400, message: '⚠️ Chưa tính lương cho kỳ này. Vui lòng bấm "Tính lương" trước khi chốt.' });
      }

      await db.query(
        `UPDATE hr_payroll_periods SET status='LOCKED', locked_at=NOW() WHERE month=?`,
        [currentMonth]
      );

      ok(res, null, 'Đã khóa bảng lương');
    } catch(e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        return fail(res, 500, '⚠️ Chưa tạo bảng hr_payroll_periods / hr_payroll_results trong CSDL. Vui lòng chạy SQL tạo 2 bảng này trước.', e);
      }
      fail(res, 500, 'Lỗi khóa bảng lương', e);
    }
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
    } catch(e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        return fail(res, 500, '⚠️ Chưa tạo bảng hr_payroll_periods / hr_payroll_results trong CSDL. Vui lòng chạy SQL tạo 2 bảng này trước.', e);
      }
      fail(res, 500, 'Lỗi mở khóa bảng lương', e);
    }
  },

  getResultDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const parts = id.split('-');
      const staffId = parts[0];
      const month = parts.slice(1).join('-');
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

      // Ưu tiên đọc snapshot đã lưu — nếu bảng chưa tồn tại hoặc lỗi bất kỳ, rơi về tính trực tiếp như cũ (KHÔNG crash)
      let p;
      const [[snapshot]] = await db.query(
        `SELECT result_json FROM hr_payroll_results WHERE employee_id=? AND period_month=?`,
        [staffId, month]
      ).catch(() => [[null]]);
      if (snapshot?.result_json) {
        p = JSON.parse(snapshot.result_json);
      } else {
        p = await calcPayroll(staffId, month);
      }

      ok(res, {
        staffName: e.name, staffCode: e.code, departmentName: e.department_name||'',
        monthLabel: `Tháng ${m}/${y}`, fromDate, toDate,
        standardWorkingDays: p.standardWorkingDays,
        actualWorkDays: p.totalWorkDays,
        workDays: p.standardWorkingDays,
        onCallDays: p.onCallDays,
        holidayDays: p.holidayDays,
        compRestDays: p.compRestDays,
        paidLeave: p.paidLeave,
        unpaidLeave: p.unpaidAbsents,
        totalWorkDays: p.totalWorkDays,
        totalAttendance: p.totalWorkDays,
        totalLeaveDays: p.paidLeave,
        usedLeaveDays: p.paidLeave,
        remainingLeaveDays: 12 - p.paidLeave,
        totalOvertimeHours: p.overtimeHours,
        compHoursUsed: 0, compHoursRemaining: 0,
        contractBasicSalary: p.baseSalary,
        contractHazardAllowance: p.hazardAllowance,
        contractSupportAllowance: p.positionAllowance,
        contractTotalSalary: p.baseSalary,
        actualWorkSalary: p.salaryByWork,
        actualBasicSalaryByWork: p.salaryByWork,
        onCallSalary: p.onCallSalary,
        overtimeAmount: p.overtimeAmount,
        responsibilityAllowance: 0,
        positionAllowance: p.positionAllowance,
        hazardAllowance: p.hazardAllowance,
        mealAllowance: p.mealAllowance,
        fuelAllowance: p.fuelAllowance,
        phoneAllowance: p.phoneAllowance,
        businessTripAllowance: p.bizTripAllowance,
        otherAllowance: p.otherAllowance,
        performanceSalary: p.kpiBonus,
        bonusAmount: p.revenueBonus,
        otherIncomeAndOvertime: p.otherIncomeAmount,
        otherIncomeAmount: p.otherIncomeAmount,
        kpiScore: p.kpiScore,
        revenueRate: p.revenueRate,
        totalBeforeDeduction: p.totalGross,
        insuranceBaseSalary: p.insuranceBase,
        socialInsurance: p.socialIns,
        healthInsurance: p.healthIns,
        unemploymentInsurance: p.unemployIns,
        unionFee: p.unionFee,
        selfDeduction: 11000000,
        familyDeduction: p.taxable ? (11000000 + 4400000 * 0) : 0,
        taxableIncome: p.taxable,
        personalIncomeTax: p.pit,
        violationPenalty: p.violationPenalty,
        totalDeduction: p.totalDeduction,
        netIncome: p.netIncome,
        finalAmount: p.netIncome,
        advancePayment: 0,
        employerSocialInsurance: Math.round(p.insuranceBase * 17.5 / 100),
        employerHealthInsurance: Math.round(p.insuranceBase * 3 / 100),
        employerUnemploymentInsurance: Math.round(p.insuranceBase * 1 / 100),
        employerUnionFee: Math.round(p.insuranceBase * 2 / 100),
        employerTotal: Math.round(p.insuranceBase * 23.5 / 100),
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết lương', e); }
  },
};


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