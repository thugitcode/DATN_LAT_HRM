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
      const { month = new Date().toISOString().slice(0, 7), page = 1, limit = 20 } = req.query;
      const fromDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);

      const [staff] = await db.query(`
        SELECT e.id, e.employee_code as code, e.full_name as name, e.avatar,
               jt.name as position
        FROM hr_employees e
        LEFT JOIN hr_contracts c ON c.employee_id=e.id AND c.status='ACTIVE'
        LEFT JOIN cat_titles jt ON jt.id=c.job_title_code
        WHERE e.status != 'RESIGNED'
        LIMIT ? OFFSET ?
      `, [parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      const [[{total}]] = await db.query(`SELECT COUNT(*) as total FROM hr_employees WHERE status!='RESIGNED'`);

      // Lấy salary data và tính lương
      const result = await Promise.all(staff.map(async s => {
        const [[salary]] = await db.query(
          `SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`, [s.id]
        );
        const [[workSummary]] = await db.query(`
          SELECT
            COUNT(*) as totalDays,
            SUM(status='PRESENT') as presentDays,
            SUM(status='ABSENT') as absentDays
          FROM hr_work_schedule_details wsd
          JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
          WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
        `, [s.id, fromDate, toDate]);

        const basicSalary = parseFloat(salary?.base_salary || 0);
        const presentDays = parseInt(workSummary?.presentDays || 0);
        const standardDays = 26;
        const actualSalary = standardDays > 0 ? (basicSalary / standardDays) * presentDays : basicSalary;

        return {
          staffId: String(s.id), staffCode: s.code, staffName: s.name,
          position: s.position || '',
          basicSalary, presentDays, standardDays,
          actualSalary: Math.round(actualSalary),
          status: 'DRAFT',
        };
      }));

      res.json({
        statusCode: 200,
        data: { data: result, pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit) } },
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
      const [[salary]] = await db.query(
        `SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`, [id]
      );
      if (!salary) return ok(res, []);
      // Trả về lịch sử lương 3 tháng gần nhất
      const history = [];
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear(), m = d.getMonth() + 1;
        history.push({
          month: `${y}-${String(m).padStart(2,'0')}`,
          basicSalary: parseFloat(salary.base_salary || 0),
          netSalary: parseFloat(salary.net_salary || 0),
          grossSalary: parseFloat(salary.gross_salary || 0),
          status: i === 0 ? 'DRAFT' : 'PUBLISHED',
        });
      }
      ok(res, history);
    } catch (e) { fail(res, 500, 'Lỗi lấy lịch sử lương', e); }
  },

  // GET /payroll/feedback
  getFeedback: async (req, res) => {
    try {
      ok(res, { data: [], pagination: { total: 0, page: 1, limit: 20 } });
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
};

module.exports = payrollController;