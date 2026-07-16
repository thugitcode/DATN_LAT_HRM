const db = require('../config/db');

const ok   = (res, data, message = 'success') => res.json({ statusCode: 200, data, message });
const fail = (res, status, message, error = null) => {
  if (error) console.error(`[leave-request] ${message}:`, error.message);
  return res.status(status).json({ statusCode: status, message });
};

const leaveRequestController = {

  // GET /leave-request?month=&status=&departmentId=&roomId=&search=
  getAll: async (req, res) => {
    try {
      const { month, status, departmentId, roomId, search, staffId, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let where = ['1=1'];
      let params = [];

      if (staffId) { where.push('lr.employee_id = ?'); params.push(staffId); }
      if (status) { where.push('lr.status = ?'); params.push(status); }
      if (month) { where.push('DATE_FORMAT(lr.from_date, "%Y-%m") = ?'); params.push(month); }
      if (departmentId) { where.push('rsd.department_code = (SELECT code FROM cat_departments WHERE id = ?)'); params.push(departmentId); }
      if (roomId) { where.push('rsr.room_code = (SELECT code FROM cat_rooms WHERE id = ?)'); params.push(roomId); }
      if (search) { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

      const [[{ total }]] = await db.query(`
        SELECT COUNT(DISTINCT lr.id) as total
        FROM hr_leave_requests lr
        JOIN hr_employees e ON e.id = lr.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id = lr.employee_id
        LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id = lr.employee_id
        WHERE ${where.join(' AND ')}
      `, params);

      const [rows] = await db.query(`
        SELECT lr.*,
               e.employee_code as staff_code, e.full_name as staff_name,
               COALESCE(jt.name, 'Nhân viên') as position,
               sub.full_name as substitute_name,
               mgr.full_name as manager_name,
               lq.name as leave_type_name,
               lrs.name as leave_reason_name, lrs.salary_rate as leave_reason_salary_rate,
               lrs.require_document as leave_reason_require_document
        FROM hr_leave_requests lr
        JOIN hr_employees e ON e.id = lr.employee_id
        LEFT JOIN hr_contracts hc ON hc.employee_id = e.id AND hc.status = 'ACTIVE'
        LEFT JOIN cat_titles jt ON jt.id = hc.job_title_code
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id = lr.employee_id
        LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id = lr.employee_id
        LEFT JOIN hr_employees sub ON sub.id = lr.substitute_id
        LEFT JOIN hr_employees mgr ON mgr.id = lr.manager_id
        LEFT JOIN cat_leave_quotas lq ON lq.id = lr.leave_quota_id
        LEFT JOIN leave_reasons lrs ON lrs.id = lr.leave_reason_id
        WHERE ${where.join(' AND ')}
        GROUP BY lr.id
        ORDER BY lr.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), parseInt(offset)]);

      const empIds = [...new Set(rows.map(r => r.employee_id))];
      let depts = [], rooms = [];
      if (empIds.length) {
        [depts] = await db.query(
          `SELECT rsd.employee_id, d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id IN (?)`,
          [empIds]
        );
        [rooms] = await db.query(
          `SELECT rsr.employee_id, r.id, r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id IN (?)`,
          [empIds]
        );
      }

      const data = rows.map(row => mapLeaveRequest(row, depts, rooms));

      // Summary
      const [[meta]] = await db.query(`
        SELECT
          COUNT(*) as total,
          SUM(lr.status='APPROVED') as approved,
          SUM(lr.status='REJECTED') as rejected,
          SUM(lr.status='PENDING') as pending
        FROM hr_leave_requests lr
        JOIN hr_employees e ON e.id = lr.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id = lr.employee_id
        LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id = lr.employee_id
        WHERE ${where.join(' AND ')}
      `, params);

      res.json({
        statusCode: 200,
        data,
        metadata: {
          total: parseInt(meta.total) || 0,
          approved: parseInt(meta.approved) || 0,
          rejected: parseInt(meta.rejected) || 0,
          pending: parseInt(meta.pending) || 0,
        },
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit) },
        message: 'success',
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy danh sách đơn nghỉ', e); }
  },

  // GET /leave-request/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [[row]] = await db.query(`
        SELECT lr.*, e.employee_code as staff_code, e.full_name as staff_name,
               hc.title_name as position, sub.full_name as substitute_name,
               mgr.full_name as manager_name, lq.name as leave_type_name,
               lrs.name as leave_reason_name, lrs.salary_rate as leave_reason_salary_rate,
               lrs.require_document as leave_reason_require_document
        FROM hr_leave_requests lr
        JOIN hr_employees e ON e.id = lr.employee_id
        LEFT JOIN hr_contracts hc ON hc.employee_id = e.id AND hc.status = 'ACTIVE'
        LEFT JOIN hr_employees sub ON sub.id = lr.substitute_id
        LEFT JOIN hr_employees mgr ON mgr.id = lr.manager_id
        LEFT JOIN cat_leave_quotas lq ON lq.id = lr.leave_quota_id
        LEFT JOIN leave_reasons lrs ON lrs.id = lr.leave_reason_id
        WHERE lr.id = ?
      `, [id]);
      if (!row) return fail(res, 404, 'Không tìm thấy đơn nghỉ');

      const [depts] = await db.query(`SELECT rsd.employee_id, d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.id=rsd.department_id WHERE rsd.employee_id=?`, [row.employee_id]);
      const [rooms] = await db.query(`SELECT rsr.employee_id, r.id, r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.id=rsr.room_id WHERE rsr.employee_id=?`, [row.employee_id]);

      ok(res, mapLeaveRequest(row, depts, rooms));
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết đơn nghỉ', e); }
  },

  // POST /leave-request
  create: async (req, res) => {
    try {
      const { staffId, leaveQuotaId, leaveReasonId, fromDate, toDate, totalDays, reason, substituteId, managerId } = req.body;
      if (!staffId || !fromDate || !toDate || !reason) return fail(res, 400, 'Thiếu thông tin đơn nghỉ');

      // Nếu chọn lý do nghỉ cụ thể, kiểm tra xem lý do đó có yêu cầu hồ sơ đính kèm không
      // (VD: "Ốm đau" yêu cầu giấy xác nhận BHXH) — hiện chỉ cảnh báo qua message, chưa chặn cứng
      // vì màn đính kèm file chưa áp dụng cho đơn nghỉ (chỉ mới có ở giải trình công).
      let leaveReasonInfo = null;
      if (leaveReasonId) {
        const [[lrInfo]] = await db.query(
          `SELECT id, name, salary_rate, require_document, leave_fund_id FROM leave_reasons WHERE id=?`,
          [leaveReasonId]
        );
        leaveReasonInfo = lrInfo || null;
      }

      const [result] = await db.query(`
        INSERT INTO hr_leave_requests (employee_id, leave_quota_id, leave_reason_id, from_date, to_date, total_days, reason, substitute_id, manager_id)
        VALUES (?,?,?,?,?,?,?,?,?)
      `, [staffId, leaveQuotaId || null, leaveReasonId || null, fromDate, toDate, totalDays || 1, reason, substituteId || null, managerId || null]);

      const msg = leaveReasonInfo?.require_document
        ? `Tạo đơn nghỉ thành công. Lưu ý: lý do "${leaveReasonInfo.name}" cần bổ sung hồ sơ/giấy tờ liên quan cho HR.`
        : 'Tạo đơn nghỉ thành công';

      ok(res, { id: String(result.insertId) }, msg);
    } catch (e) { fail(res, 500, 'Lỗi tạo đơn nghỉ', e); }
  },

  // GET /leave-request/for-manager/:managerId
  // Chỉ trả về đơn nghỉ phép của các nhân viên có managerId này là "Quản lý trực tiếp"
  // trong hợp đồng ACTIVE, và đang chờ quản lý duyệt (PENDING).
  getForManager: async (req, res) => {
    try {
      const { managerId } = req.params;
      if (!managerId) return fail(res, 400, 'Thiếu managerId');

      const [managed] = await db.query(
        `SELECT DISTINCT employee_id FROM hr_contracts
         WHERE status = 'ACTIVE'
         AND JSON_CONTAINS(direct_manager_ids, JSON_QUOTE(CAST(? AS CHAR)))`,
        [managerId]
      );
      const empIds = managed.map(m => m.employee_id);

      if (!empIds.length) {
        return ok(res, [], 'Bạn hiện không quản lý trực tiếp nhân viên nào');
      }

      const [rows] = await db.query(`
        SELECT lr.*,
               e.employee_code as staff_code, e.full_name as staff_name,
               COALESCE(jt.name, 'Nhân viên') as position,
               sub.full_name as substitute_name,
               mgr.full_name as manager_name,
               lq.name as leave_type_name
        FROM hr_leave_requests lr
        JOIN hr_employees e ON e.id = lr.employee_id
        LEFT JOIN hr_contracts hc ON hc.employee_id = e.id AND hc.status = 'ACTIVE'
        LEFT JOIN cat_titles jt ON jt.id = hc.job_title_code
        LEFT JOIN hr_employees sub ON sub.id = lr.substitute_id
        LEFT JOIN hr_employees mgr ON mgr.id = lr.manager_id
        LEFT JOIN cat_leave_quotas lq ON lq.id = lr.leave_quota_id
        WHERE lr.employee_id IN (?) AND lr.status = 'PENDING'
        GROUP BY lr.id
        ORDER BY lr.created_at DESC
      `, [empIds]);

      const empIds2 = [...new Set(rows.map(r => r.employee_id))];
      let depts = [], rooms = [];
      if (empIds2.length) {
        [depts] = await db.query(
          `SELECT rsd.employee_id, d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id IN (?)`,
          [empIds2]
        );
        [rooms] = await db.query(
          `SELECT rsr.employee_id, r.id, r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id IN (?)`,
          [empIds2]
        );
      }

      const data = rows.map(row => mapLeaveRequest(row, depts, rooms));
      ok(res, data, 'success');
    } catch (e) { fail(res, 500, 'Lỗi lấy danh sách đơn nghỉ cần bạn duyệt', e); }
  },

  // PATCH /leave-request/:id/approve
  approve: async (req, res) => {
    try {
      const { id } = req.params;
      const { approvedById } = req.body;
      // Kiểm tra status hiện tại
      const [[lr]] = await db.query(
        `SELECT lr.status, lr.employee_id, lr.from_date, lr.to_date, lrs.salary_rate
         FROM hr_leave_requests lr
         LEFT JOIN leave_reasons lrs ON lrs.id = lr.leave_reason_id
         WHERE lr.id=?`, [id]
      );
      if (!lr) return fail(res, 404, 'Không tìm thấy đơn nghỉ');
      // PENDING -> MANAGER_APPROVED, MANAGER_APPROVED -> APPROVED
      const newStatus = lr.status === 'PENDING' ? 'MANAGER_APPROVED' : 'APPROVED';
      await db.query(
        `UPDATE hr_leave_requests SET status=?, approved_by_id=?, approved_at=NOW() WHERE id=?`,
        [newStatus, approvedById || null, id]
      );

      // Chỉ đồng bộ sang bảng chấm công ở bước duyệt CUỐI (APPROVED) — tránh cập nhật sớm khi
      // mới duyệt cấp 1 (MANAGER_APPROVED), vì lúc đó đơn có thể còn bị HR từ chối ở bước sau.
      // Đồng bộ để: (1) không hiện "chưa chấm công"/cho phép tự chấm công nhầm vào đúng ngày đã
      // nghỉ, (2) bảng chấm công hiển thị đúng "Nghỉ phép" thay vì trống/ca bình thường.
      if (newStatus === 'APPROVED') {
        const leaveStatus = (lr.salary_rate == null || parseFloat(lr.salary_rate) > 0) ? 'LEAVE_PAID' : 'LEAVE';
        await db.query(
          `UPDATE hr_work_schedule_details wsd
           JOIN hr_work_schedules ws ON ws.id = wsd.work_schedule_id
           SET wsd.status = ?
           WHERE ws.employee_id = ? AND wsd.work_date BETWEEN ? AND ?`,
          [leaveStatus, lr.employee_id, lr.from_date, lr.to_date]
        );
      }

      ok(res, null, 'Duyệt đơn nghỉ thành công');
    } catch (e) { fail(res, 500, 'Lỗi duyệt đơn nghỉ', e); }
  },

  // PATCH /leave-request/:id/reject
  reject: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, rejectedReason } = req.body;
      const rejectReason = rejectedReason || reason || '';
      await db.query(`UPDATE hr_leave_requests SET status='HR_REJECTED', rejected_reason=? WHERE id=?`, [rejectReason, id]);
      ok(res, null, 'Từ chối đơn nghỉ thành công');
    } catch (e) { fail(res, 500, 'Lỗi từ chối đơn nghỉ', e); }
  },
};

function mapLeaveRequest(row, depts, rooms) {
  return {
    id: String(row.id),
    staffId: String(row.employee_id),
    staffCode: row.staff_code,
    staffName: row.staff_name,
    position: row.position,
    departments: depts.filter(d => d.employee_id === row.employee_id).map(d => ({ id: String(d.id), name: d.name })),
    rooms: rooms.filter(r => r.employee_id === row.employee_id).map(r => ({ id: String(r.id), name: r.name })),
    leaveQuotaId: row.leave_quota_id ? String(row.leave_quota_id) : null,
    leaveType: row.leave_type_name || '',
    leaveReasonId: row.leave_reason_id ? String(row.leave_reason_id) : null,
    leaveReasonName: row.leave_reason_name || '',
    leaveReasonSalaryRate: row.leave_reason_salary_rate != null ? parseFloat(row.leave_reason_salary_rate) : null,
    leaveReasonRequireDocument: !!row.leave_reason_require_document,
    fromDate: row.from_date,
    toDate: row.to_date,
    totalDays: parseFloat(row.total_days) || 1,
    reason: row.reason,
    substituteId: row.substitute_id ? String(row.substitute_id) : null,
    substituteName: row.substitute_name || '',
    managerId: row.manager_id ? String(row.manager_id) : null,
    managerName: row.manager_name || '',
    status: row.status,
    approvedById: row.approved_by_id ? String(row.approved_by_id) : null,
    approvedAt: row.approved_at,
    rejectedReason: row.rejected_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

leaveRequestController.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await db.query(`SELECT status FROM hr_leave_requests WHERE id=? LIMIT 1`, [id]);
    if (!row) return fail(res, 404, 'Không tìm thấy đơn');
    if (row.status !== 'PENDING') return fail(res, 400, 'Chỉ hủy được đơn đang chờ duyệt');
    await db.query(`UPDATE hr_leave_requests SET status='CANCELLED', updated_at=NOW() WHERE id=?`, [id]);
    ok(res, null, 'Đã hủy đơn nghỉ');
  } catch(e) { fail(res, 500, 'Lỗi hủy đơn', e); }
};

leaveRequestController.managerApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;
    const [[lr]] = await db.query(`SELECT status, manager_id FROM hr_leave_requests WHERE id=?`, [id]);
    if (!lr) return fail(res, 404, 'Không tìm thấy đơn nghỉ');
    if (lr.status !== 'PENDING') return fail(res, 400, 'Đơn không ở trạng thái chờ duyệt');
    await db.query(
      `UPDATE hr_leave_requests SET status='MANAGER_APPROVED', approved_by_id=?, approved_at=NOW() WHERE id=?`,
      [managerId || null, id]
    );
    ok(res, null, 'Trưởng khoa đã xác nhận đơn nghỉ');
  } catch(e) { fail(res, 500, 'Lỗi duyệt đơn', e); }
};

module.exports = leaveRequestController;