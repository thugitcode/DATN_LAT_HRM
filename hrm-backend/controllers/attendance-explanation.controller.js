const db = require('../config/db');

const ok   = (res, data, message = 'success') => res.json({ statusCode: 200, data, message });
const fail = (res, status, message, error = null) => {
  if (error) console.error(`[attendance-explanation] ${message}:`, error.message);
  return res.status(status).json({ statusCode: status, message });
};

const attendanceExplanationController = {

  // GET /attendance-explanation
  getAll: async (req, res) => {
    try {
      const { month, status, type, departmentId, roomId, search, staffId, fromDate, toDate, page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let where = ['1=1'];
      let params = [];

      if (staffId)     { where.push('ae.employee_id = ?'); params.push(staffId); }
      if (status)      { where.push('ae.status = ?'); params.push(status); }
      if (type)        { where.push('ae.type = ?'); params.push(type); }
      if (month)       { where.push('DATE_FORMAT(ae.work_date, "%Y-%m") = ?'); params.push(month); }
      if (fromDate)    { where.push('ae.work_date >= ?'); params.push(fromDate); }
      if (toDate)      { where.push('ae.work_date <= ?'); params.push(toDate); }
      if (departmentId){ where.push('rsd.department_code = (SELECT code FROM cat_departments WHERE id=?)'); params.push(departmentId); }
      if (roomId)      { where.push('rsr.room_code = (SELECT code FROM cat_rooms WHERE id=?)'); params.push(roomId); }
      if (search)      { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }

      const [[{ total }]] = await db.query(`
        SELECT COUNT(DISTINCT ae.id) as total
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id = ae.employee_id
        LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id = ae.employee_id
        WHERE ${where.join(' AND ')}
      `, params);

      const [rows] = await db.query(`
        SELECT ae.*, ae.status as ae_status,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar as staff_avatar,
               '' as position,
               mgr.full_name as manager_name,
               hr_emp.full_name as hr_name,
               rej.full_name as rejected_by_name
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id = ae.employee_id
        LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id = ae.employee_id
        LEFT JOIN hr_employees mgr ON mgr.id = ae.approved_by_manager_id
        LEFT JOIN hr_employees hr_emp ON hr_emp.id = ae.approved_by_hr_id
        LEFT JOIN hr_employees rej ON rej.id = ae.rejected_by_id
        WHERE ${where.join(' AND ')}
        GROUP BY ae.id
        ORDER BY ae.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      const ids = rows.map(r => r.id);
      let attachments = [];
      if (ids.length) {
        [attachments] = await db.query(
          `SELECT * FROM hr_attendance_explanation_attachments WHERE explanation_id IN (?)`, [ids]
        );
      }

      const empIds = [...new Set(rows.map(r => r.employee_id))];
      let depts = [], rooms = [];
      if (empIds.length) {
        [depts] = await db.query(
          `SELECT rsd.employee_id, d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id IN (?)`, [empIds]
        );
        [rooms] = await db.query(
          `SELECT rsr.employee_id, r.id, r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id IN (?)`, [empIds]
        );
      }

      const data = rows.map(row => mapExplanation(row, attachments, depts, rooms));

      const [[summary]] = await db.query(`
        SELECT COUNT(*) as totalRequests,
          SUM(ae.status='PENDING' OR ae.status='MANAGER_APPROVED') as pending,
          SUM(ae.status='APPROVED') as approved,
          SUM(ae.status='MANAGER_REJECTED' OR ae.status='HR_REJECTED') as rejected
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id = ae.employee_id
        LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id = ae.employee_id
        WHERE ${where.join(' AND ')}
      `, params);

      res.json({
        statusCode: 200, data,
        metadata: {
          totalRequests: parseInt(summary.totalRequests) || 0,
          pending: parseInt(summary.pending) || 0,
          approved: parseInt(summary.approved) || 0,
          rejected: parseInt(summary.rejected) || 0,
          byType: null,
        },
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit) },
        message: 'success',
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy danh sách giải trình', e); }
  },

  // GET /attendance-explanation/:id
  getById: async (req, res) => {
    try {
      const [[row]] = await db.query(`
        SELECT ae.*, e.employee_code as staff_code, e.full_name as staff_name, e.avatar as staff_avatar,
               '' as position, mgr.full_name as manager_name
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        
        LEFT JOIN hr_employees mgr ON mgr.id = ae.approved_by_manager_id
        WHERE ae.id = ?
      `, [req.params.id]);
      if (!row) return fail(res, 404, 'Không tìm thấy giải trình');

      const [attachments] = await db.query(`SELECT * FROM hr_attendance_explanation_attachments WHERE explanation_id=?`, [req.params.id]);
      const [depts] = await db.query(`SELECT rsd.employee_id, d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id=?`, [row.employee_id]);
      const [rooms] = await db.query(`SELECT rsr.employee_id, r.id, r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id=?`, [row.employee_id]);

      ok(res, mapExplanation(row, attachments, depts, rooms));
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết giải trình', e); }
  },

  // POST /attendance-explanation/:id/approve — Duyệt + cập nhật chấm công
  approve: async (req, res) => {
    try {
      const { id } = req.params;
      const { managerId, comment } = req.body;

      // Lấy thông tin giải trình
      const [[ae]] = await db.query(`SELECT * FROM hr_attendance_explanations WHERE id=?`, [id]);
      if (!ae) return fail(res, 404, 'Không tìm thấy giải trình');

      // Cập nhật trạng thái giải trình
      await db.query(`
        UPDATE hr_attendance_explanations
        SET status='APPROVED', approved_by_hr_id=?, hr_approved_at=NOW(), hr_comment=?
        WHERE id=?
      `, [managerId || null, comment || null, id]);

      // Cập nhật chấm công: tìm record ngày đó của nhân viên và set PRESENT
      await updateAttendanceAfterApproval(ae.employee_id, ae.work_date, ae.type);

      ok(res, null, 'Duyệt giải trình thành công');
    } catch (e) { fail(res, 500, 'Lỗi duyệt giải trình', e); }
  },

  // POST /attendance-explanation/:id/manager-approve
  managerApprove: async (req, res) => {
    try {
      const { id } = req.params;
      const { hrId, comment } = req.body;

      const [[ae]] = await db.query(`SELECT * FROM hr_attendance_explanations WHERE id=?`, [id]);
      if (!ae) return fail(res, 404, 'Không tìm thấy giải trình');

      await db.query(`
        UPDATE hr_attendance_explanations
        SET status='APPROVED', approved_by_hr_id=?, hr_approved_at=NOW(), hr_comment=?
        WHERE id=?
      `, [hrId || null, comment || null, id]);

      await updateAttendanceAfterApproval(ae.employee_id, ae.work_date, ae.type);

      ok(res, null, 'Phê duyệt giải trình thành công');
    } catch (e) { fail(res, 500, 'Lỗi phê duyệt giải trình', e); }
  },

  // POST /attendance-explanation/:id/reject
  reject: async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectedById, reason } = req.body;
      await db.query(`
        UPDATE hr_attendance_explanations
        SET status='HR_REJECTED', rejected_by_id=?, rejected_reason=?, rejected_at=NOW()
        WHERE id=?
      `, [rejectedById || null, reason || '', id]);
      ok(res, null, 'Từ chối giải trình thành công');
    } catch (e) { fail(res, 500, 'Lỗi từ chối giải trình', e); }
  },

  // POST /attendance-explanation/bulk-approve
  bulkApprove: async (req, res) => {
    try {
      const { ids, managerId } = req.body;
      if (!ids?.length) return fail(res, 400, 'Thiếu danh sách ID');

      const [explanations] = await db.query(`SELECT * FROM hr_attendance_explanations WHERE id IN (?)`, [ids]);

      await db.query(`
        UPDATE hr_attendance_explanations
        SET status='APPROVED', approved_by_hr_id=?, hr_approved_at=NOW()
        WHERE id IN (?)
      `, [managerId || null, ids]);

      // Cập nhật chấm công cho tất cả
      for (const ae of explanations) {
        await updateAttendanceAfterApproval(ae.employee_id, ae.work_date, ae.type);
      }

      ok(res, null, `Duyệt ${ids.length} giải trình thành công`);
    } catch (e) { fail(res, 500, 'Lỗi duyệt hàng loạt', e); }
  },

  // POST /attendance-explanation/seed-mock — Sinh đơn giải trình mẫu
  seedMock: async (req, res) => {
    try {
      const [emps] = await db.query(`SELECT id, employee_code, full_name FROM hr_employees WHERE status!='RESIGNED' LIMIT 3`);
      if (!emps.length) return fail(res, 400, 'Không có nhân viên nào');

      const types = ['MISSING_CHECK_IN', 'LATE', 'MISSING_CHECK_OUT'];
      const reasons = [
        'Quên quẹt thẻ vào do bận cấp cứu ca đêm',
        'Đi muộn do kẹt xe đột xuất',
        'Quên quẹt thẻ ra do bàn giao ca gấp',
      ];
      const date = new Date().toISOString().slice(0, 10);

      const inserted = [];
      for (let i = 0; i < emps.length; i++) {
        const emp = emps[i];
        const [r] = await db.query(
          `INSERT INTO hr_attendance_explanations (employee_id, work_date, type, reason, status, created_at) VALUES (?,?,?,?,'PENDING',NOW())`,
          [emp.id, date, types[i], reasons[i]]
        );
        inserted.push({ id: r.insertId, staffName: emp.full_name, type: types[i], date });
      }

      res.json({ statusCode: 200, data: inserted, message: `Đã tạo ${inserted.length} đơn giải trình mẫu` });
    } catch (e) { fail(res, 500, 'Lỗi tạo đơn giải trình mẫu', e); }
  },
};

// ─── Cập nhật chấm công sau khi duyệt giải trình ────────────
async function updateAttendanceAfterApproval(employeeId, workDate, type) {
  try {
    // Tìm record chấm công ngày đó
    const [wsds] = await db.query(`
      SELECT wsd.id, wsd.check_in_time, wsd.check_out_time,
             ws.employee_id, st.start_time, st.end_time, st.code as shift_code
      FROM hr_work_schedule_details wsd
      JOIN hr_work_schedules ws ON ws.id = wsd.work_schedule_id
      JOIN shifts st ON st.id = wsd.shift_template_id
      WHERE ws.employee_id = ? AND wsd.work_date = ?
    `, [employeeId, workDate]);

    if (!wsds.length) return;

    for (const wsd of wsds) {
      let checkIn = wsd.check_in_time;
      let checkOut = wsd.check_out_time;

      // Nếu thiếu check-in/out thì sinh lại từ ca
      if (!checkIn || type === 'MISSING_CHECK_IN' || type === 'ABSENT') {
        const mock = getMockTimes(wsd.shift_code, wsd.start_time, workDate);
        checkIn  = checkIn  || mock.checkIn;
        checkOut = checkOut || mock.checkOut;
      }
      if (!checkOut || type === 'MISSING_CHECK_OUT') {
        const mock = getMockTimes(wsd.shift_code, wsd.start_time, workDate);
        checkOut = mock.checkOut;
      }

      await db.query(`
        UPDATE hr_work_schedule_details
        SET status='PRESENT', check_in_time=?, check_out_time=?
        WHERE id=?
      `, [checkIn, checkOut, wsd.id]);
    }
  } catch (e) {
    console.error('[updateAttendanceAfterApproval] Error:', e.message);
  }
}

function getMockTimes(shiftCode, startTime, date) {
  const code = (shiftCode || '').toUpperCase();
  const st = startTime || '07:00:00';
  let checkIn, checkOut;

  if (code.startsWith('HC') || st.startsWith('07') || st.startsWith('08')) {
    checkIn = `${date} 07:55:00`; checkOut = `${date} 17:05:00`;
  } else if (code.startsWith('S') || st.startsWith('05') || st.startsWith('06')) {
    checkIn = `${date} 05:55:00`; checkOut = `${date} 14:05:00`;
  } else if (code.startsWith('C') || st.startsWith('13') || st.startsWith('14')) {
    checkIn = `${date} 13:55:00`; checkOut = `${date} 22:05:00`;
  } else if (code.startsWith('D') || code.includes('Đ') || st.startsWith('21') || st.startsWith('22')) {
    const next = new Date(date); next.setDate(next.getDate() + 1);
    checkIn = `${date} 21:55:00`; checkOut = `${next.toISOString().slice(0,10)} 06:05:00`;
  } else {
    checkIn = `${date} ${st}`; checkOut = `${date} 17:00:00`;
  }
  return { checkIn, checkOut };
}

function mapExplanation(row, attachments, depts, rooms) {
  const att = attachments.filter(a => a.explanation_id === row.id);
  return {
    id: String(row.id),
    staffId: String(row.employee_id),
    staffCode: row.staff_code,
    staffName: row.staff_name,
    staffAvatar: row.staff_avatar,
    position: row.position || '',
    departments: depts.filter(d => d.employee_id === row.employee_id).map(d => ({ id: String(d.id), name: d.name })),
    rooms: rooms.filter(r => r.employee_id === row.employee_id).map(r => ({ id: String(r.id), name: r.name })),
    departmentName: depts.find(d => d.employee_id === row.employee_id)?.name || '',
    roomName: rooms.find(r => r.employee_id === row.employee_id)?.name || '',
    date: row.work_date,
    type: row.type,
    typeLabel: getTypeLabel(row.type),
    reason: row.reason,
    managerConfirmation: row.manager_confirmation,
    hrComment: row.hr_comment,
    attachments: att.map(a => ({ id: String(a.id), fileUrl: a.file_url, fileName: a.file_name, fileType: a.file_type, fileSize: a.file_size })),
    attachmentCount: att.length,
    firstAttachmentName: att[0]?.file_name || '',
    managerName: row.manager_name || '',
    approvedByManagerId: row.approved_by_manager_id ? String(row.approved_by_manager_id) : undefined,
    managerApprovedAt: row.manager_approved_at,
    approvedByHrId: row.approved_by_hr_id ? String(row.approved_by_hr_id) : undefined,
    hrApprovedAt: row.hr_approved_at,
    status: row.status,
    rejectedById: row.rejected_by_id ? String(row.rejected_by_id) : undefined,
    rejectedByName: row.rejected_by_name || '',
    rejectedReason: row.rejected_reason,
    rejectedAt: row.rejected_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getTypeLabel(type) {
  const map = {
    LATE: 'Đi muộn', EARLY_LEAVE: 'Về sớm',
    MISSING_CHECK_IN: 'Quên chấm vào', MISSING_CHECK_OUT: 'Quên chấm ra',
    ABSENT: 'Vắng mặt', MISSING_HOURS: 'Thiếu giờ',
    BUSINESS_TRIP: 'Công tác', SICK: 'Ốm', OTHER: 'Khác',
  };
  return map[type] || type;
}

module.exports = attendanceExplanationController;