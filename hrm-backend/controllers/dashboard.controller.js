const db = require('../config/db');
const ok   = (res, data, msg = 'success') => res.json({ statusCode: 200, data, message: msg });
const fail = (res, status, msg, err = null) => {
  if (err) console.error(`[dashboard] ${msg}:`, err.message);
  return res.status(status).json({ statusCode: status, message: msg });
};

// LƯU Ý: dùng đúng cách tính "hôm nay theo giờ VN" đã thống nhất — new Date().toISOString() trả UTC,
// lệch múi giờ nếu dùng trực tiếp (đã phát hiện + fix lỗi này ở work-schedule.controller.js).
function getVietnamToday() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
}

module.exports = {
  // GET /dashboard/reports?fromMonth=YYYY-MM&toMonth=YYYY-MM — báo cáo chi tiết có bộ lọc khoảng thời gian
  getReports: async (req, res) => {
    try {
      const today = getVietnamToday();
      const toMonth   = req.query.toMonth   || today.slice(0, 7);
      const fromMonth = req.query.fromMonth || (() => {
        const [y, m] = toMonth.split('-').map(Number);
        const d = new Date(y, m - 1 - 5, 1); // mặc định lấy 6 tháng gần nhất
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })();
      const fromDate = `${fromMonth}-01`;
      const [ty, tm] = toMonth.split('-').map(Number);
      const toDateFull = new Date(ty, tm, 0).toISOString().slice(0, 10);

      // Sinh danh sách tháng trong khoảng lọc, để đảm bảo tháng nào cũng có mặt trên biểu đồ (dù = 0)
      const months = [];
      let cy = parseInt(fromMonth.slice(0, 4)), cm = parseInt(fromMonth.slice(5, 7));
      while (`${cy}-${String(cm).padStart(2, '0')}` <= toMonth) {
        months.push(`${cy}-${String(cm).padStart(2, '0')}`);
        cm++; if (cm > 12) { cm = 1; cy++; }
      }

      // 1. Biến động nhân sự — số nhân viên MỚI theo tháng (dựa vào ngày bắt đầu hợp đồng sớm nhất)
      const [hiredRows] = await db.query(`
        SELECT DATE_FORMAT(MIN(hc.start_date), '%Y-%m') as month, COUNT(*) as cnt
        FROM (SELECT employee_id, MIN(start_date) as start_date FROM hr_contracts GROUP BY employee_id) hc
        WHERE hc.start_date BETWEEN ? AND ?
        GROUP BY month
      `, [fromDate, toDateFull]).catch(() => [[]]);
      const hiredMap = Object.fromEntries(hiredRows.map(r => [r.month, parseInt(r.cnt)]));

      // 2. Chi phí lương theo tháng — từ snapshot ĐÃ TÍNH (hr_payroll_results), tháng nào chưa tính thì = 0
      const [payrollRows] = await db.query(`
        SELECT period_month as month,
               SUM(total_gross) as totalGross, SUM(total_deduction) as totalDeduction, SUM(net_income) as netIncome
        FROM hr_payroll_results
        WHERE period_month BETWEEN ? AND ?
        GROUP BY period_month
      `, [fromMonth, toMonth]).catch(() => [[]]);
      const payrollMap = Object.fromEntries(payrollRows.map(r => [r.month, r]));

      // 3. Chấm công theo khoa — tỷ lệ đi muộn/vắng trong khoảng lọc
      const [attByDept] = await db.query(`
        SELECT d.name,
               COUNT(*) as total,
               SUM(wsd.status = 'LATE') as lateCount,
               SUM(wsd.status = 'ABSENT') as absentCount
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id = wsd.work_schedule_id
        JOIN hr_staff_departments rsd ON rsd.employee_id = ws.employee_id
        JOIN cat_departments d ON d.code = rsd.department_code
        WHERE wsd.work_date BETWEEN ? AND ?
        GROUP BY d.id, d.name
        ORDER BY total DESC LIMIT 8
      `, [fromDate, toDateFull]).catch(() => [[]]);

      // 4. Nghỉ phép theo loại — tổng ngày nghỉ đã duyệt trong khoảng lọc, theo từng quỹ nghỉ (cat_leave_quotas)
      const [leaveByType] = await db.query(`
        SELECT lq.name, SUM(lr.total_days) as totalDays, COUNT(*) as requestCount
        FROM hr_leave_requests lr
        LEFT JOIN cat_leave_quotas lq ON lq.id = lr.leave_quota_id
        WHERE lr.status = 'APPROVED' AND lr.from_date BETWEEN ? AND ?
        GROUP BY lq.id, lq.name
        ORDER BY totalDays DESC
      `, [fromDate, toDateFull]).catch(() => [[]]);

      ok(res, {
        fromMonth, toMonth,
        headcountTrend: months.map(m => ({ month: m, hired: hiredMap[m] || 0 })),
        payrollTrend: months.map(m => ({
          month: m,
          totalGross: parseFloat(payrollMap[m]?.totalGross || 0),
          totalDeduction: parseFloat(payrollMap[m]?.totalDeduction || 0),
          netIncome: parseFloat(payrollMap[m]?.netIncome || 0),
        })),
        attendanceByDept: attByDept.map(d => ({
          name: d.name,
          total: parseInt(d.total),
          lateRate: d.total > 0 ? Math.round((d.lateCount / d.total) * 1000) / 10 : 0,
          absentRate: d.total > 0 ? Math.round((d.absentCount / d.total) * 1000) / 10 : 0,
        })),
        leaveByType: leaveByType.map(l => ({
          name: l.name || 'Khác',
          totalDays: parseFloat(l.totalDays) || 0,
          requestCount: parseInt(l.requestCount),
        })),
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy báo cáo chi tiết', e); }
  },

  // GET /dashboard/summary — tổng hợp số liệu tổng quan cho Admin, gộp 1 API tránh gọi lẻ nhiều lần
  getSummary: async (req, res) => {
    try {
      const today = getVietnamToday();
      const month = today.slice(0, 7);
      const fromDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const toDate = new Date(y, m, 0).toISOString().slice(0, 10);

      // 1. Nhân sự
      const [[emp]] = await db.query(`
        SELECT
          COUNT(*) as total,
          SUM(status = 'WORKING') as working,
          SUM(status = 'RESIGNED') as resigned
        FROM hr_employees
      `);

      // 2. Chấm công hôm nay — dựa trên ca đã phân cho hôm nay
      const [[att]] = await db.query(`
        SELECT
          COUNT(*) as totalScheduled,
          SUM(wsd.check_in_time IS NOT NULL) as checkedIn,
          SUM(wsd.status = 'LATE') as late,
          SUM(wsd.status = 'ABSENT') as absent
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id = wsd.work_schedule_id
        JOIN hr_employees e ON e.id = ws.employee_id
        WHERE wsd.work_date = ? AND e.status != 'RESIGNED'
      `, [today]);

      // 3. Đơn chờ xử lý
      const [[leavePending]] = await db.query(
        `SELECT COUNT(*) as cnt FROM hr_leave_requests WHERE status IN ('PENDING','MANAGER_APPROVED')`
      );
      const [[explanationPending]] = await db.query(
        `SELECT COUNT(*) as cnt FROM hr_attendance_explanations WHERE status IN ('PENDING','MANAGER_APPROVED')`
      );
      const [[feedbackPending]] = await db.query(
        `SELECT COUNT(*) as cnt FROM hr_payslip_feedback WHERE status = 'PENDING'`
      ).catch(() => [[{ cnt: 0 }]]);

      // 4. Trạng thái kỳ lương tháng hiện tại
      const [[period]] = await db.query(
        `SELECT status, calculated_at, locked_at FROM hr_payroll_periods WHERE month=?`, [month]
      ).catch(() => [[null]]);

      // 5. Cơ cấu theo khoa (top 5 khoa nhiều nhân viên nhất)
      const [byDept] = await db.query(`
        SELECT d.name, COUNT(DISTINCT rsd.employee_id) as cnt
        FROM hr_staff_departments rsd
        JOIN cat_departments d ON d.code = rsd.department_code
        JOIN hr_employees e ON e.id = rsd.employee_id AND e.status != 'RESIGNED'
        GROUP BY d.id, d.name
        ORDER BY cnt DESC LIMIT 5
      `).catch(() => [[]]);

      ok(res, {
        employees: {
          total: parseInt(emp.total) || 0,
          working: parseInt(emp.working) || 0,
          resigned: parseInt(emp.resigned) || 0,
        },
        attendanceToday: {
          totalScheduled: parseInt(att.totalScheduled) || 0,
          checkedIn: parseInt(att.checkedIn) || 0,
          notCheckedIn: (parseInt(att.totalScheduled) || 0) - (parseInt(att.checkedIn) || 0),
          late: parseInt(att.late) || 0,
          absent: parseInt(att.absent) || 0,
        },
        pending: {
          leaveRequests: parseInt(leavePending.cnt) || 0,
          explanations: parseInt(explanationPending.cnt) || 0,
          payslipFeedback: parseInt(feedbackPending.cnt) || 0,
        },
        payrollPeriod: {
          month,
          status: period?.status || 'DRAFT',
          calculatedAt: period?.calculated_at || null,
          lockedAt: period?.locked_at || null,
        },
        byDepartment: byDept.map(d => ({ name: d.name, count: parseInt(d.cnt) })),
        today,
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy tổng quan hệ thống', e); }
  },
};