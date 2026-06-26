const db = require('../config/db');

const ok   = (res, data, message = 'success') => res.json({ statusCode: 200, data, message });
const fail = (res, status, message, error = null) => {
  if (error) console.error(`[attendance-explanation] ${message}:`, error.message);
  return res.status(status).json({ statusCode: status, message });
};

// ─── helpers ────────────────────────────────────────────────
function getTypeLabel(type) {
  const map = {
    LATE: 'Đi muộn', EARLY_LEAVE: 'Về sớm',
    MISSING_CHECK_IN: 'Quên chấm vào', MISSING_CHECK_OUT: 'Quên chấm ra',
    ABSENT: 'Vắng mặt', MISSING_HOURS: 'Thiếu giờ',
    BUSINESS_TRIP: 'Công tác', SICK: 'Ốm', OTHER: 'Khác',
  };
  return map[type] || type;
}

function mapRow(row, attachments, depts, rooms) {
  const att = (attachments || []).filter(a => a.explanation_id === row.id);
  return {
    id: String(row.id),
    staffId: String(row.employee_id),
    staffCode: row.staff_code,
    staffName: row.staff_name,
    staffAvatar: row.staff_avatar,
    position: '',
    departments: (depts || []).filter(d => d.employee_id === row.employee_id).map(d => ({ id: String(d.id), name: d.name })),
    rooms: (rooms || []).filter(r => r.employee_id === row.employee_id).map(r => ({ id: String(r.id), name: r.name })),
    departmentName: (depts || []).find(d => d.employee_id === row.employee_id)?.name || '',
    roomName: (rooms || []).find(r => r.employee_id === row.employee_id)?.name || '',
    date: row.work_date,
    dateLabel: (() => {
      try { return row.work_date ? new Date(row.work_date).toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'2-digit', day:'2-digit' }) : ''; }
      catch(e) { return ''; }
    })(),
    type: row.type,
    typeLabel: getTypeLabel(row.type),
    shiftName: row.shift_name || '',
    shiftStartTime: row.shift_start_time || '',
    shiftEndTime: row.shift_end_time || '',
    actualCheckIn: row.actual_check_in || null,
    actualCheckOut: row.actual_check_out || null,
    totalActualWorkingHours: (() => {
      if (!row.actual_check_in || !row.actual_check_out) return null;
      const d = (new Date(row.actual_check_out) - new Date(row.actual_check_in)) / 3600000;
      return Math.round((d < 0 ? d + 24 : d) * 100) / 100;
    })(),
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

async function getDeptRooms(empIds) {
  if (!empIds.length) return { depts: [], rooms: [] };
  const [depts] = await db.query(
    `SELECT rsd.employee_id, d.id, d.name
     FROM hr_staff_departments rsd
     JOIN cat_departments d ON d.code = rsd.department_code
     WHERE rsd.employee_id IN (?)`, [empIds]
  );
  const [rooms] = await db.query(
    `SELECT rsr.employee_id, r.id, r.name
     FROM hr_staff_rooms rsr
     JOIN cat_rooms r ON r.code = rsr.room_code
     WHERE rsr.employee_id IN (?)`, [empIds]
  );
  return { depts, rooms };
}

const ctrl = {

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
      if (month)       { where.push('DATE_FORMAT(ae.work_date,"%Y-%m") = ?'); params.push(month); }
      if (fromDate)    { where.push('ae.work_date >= ?'); params.push(fromDate); }
      if (toDate)      { where.push('ae.work_date <= ?'); params.push(toDate); }
      if (departmentId){ where.push('EXISTS(SELECT 1 FROM hr_staff_departments sd JOIN cat_departments cd ON cd.code=sd.department_code WHERE sd.employee_id=ae.employee_id AND cd.id=?)'); params.push(departmentId); }
      if (roomId)      { where.push('EXISTS(SELECT 1 FROM hr_staff_rooms sr JOIN cat_rooms cr ON cr.code=sr.room_code WHERE sr.employee_id=ae.employee_id AND cr.id=?)'); params.push(roomId); }
      if (search)      { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }

      const [[{ total }]] = await db.query(`
        SELECT COUNT(DISTINCT ae.id) as total
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        WHERE ${where.join(' AND ')}
      `, params);

      const [rows] = await db.query(`
        SELECT ae.id, ae.employee_id, ae.work_date, ae.type, ae.reason,
               ae.status, ae.manager_confirmation, ae.hr_comment,
               ae.approved_by_manager_id, ae.manager_approved_at,
               ae.approved_by_hr_id, ae.hr_approved_at,
               ae.rejected_by_id, ae.rejected_reason, ae.rejected_at,
               ae.created_at, ae.updated_at,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar as staff_avatar,
               mgr.full_name as manager_name,
               rej.full_name as rejected_by_name,
               st.name as shift_name,
               st.start_time as shift_start_time,
               st.end_time as shift_end_time,
               wsd.check_in_time as actual_check_in,
               wsd.check_out_time as actual_check_out
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        LEFT JOIN hr_employees mgr ON mgr.id = ae.approved_by_manager_id
        LEFT JOIN hr_employees rej ON rej.id = ae.rejected_by_id
        LEFT JOIN hr_work_schedule_details wsd
               ON wsd.employee_id = ae.employee_id
              AND DATE_FORMAT(wsd.work_date,'%Y-%m-%d') = DATE_FORMAT(ae.work_date,'%Y-%m-%d')
        LEFT JOIN shifts st ON st.id = wsd.shift_template_id
        WHERE ${where.join(' AND ')}
        GROUP BY ae.id
        ORDER BY ae.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      const ids    = rows.map(r => r.id);
      const empIds = [...new Set(rows.map(r => r.employee_id))];
      let attachments = [];
      if (ids.length) {
        [attachments] = await db.query(
          `SELECT * FROM hr_attendance_explanation_attachments WHERE explanation_id IN (?)`, [ids]
        ).catch(() => [[]]);
      }
      const { depts, rooms } = await getDeptRooms(empIds);
      const data = rows.map(row => mapRow(row, attachments, depts, rooms));

      const [[summary]] = await db.query(`
        SELECT COUNT(*) as totalRequests,
          SUM(ae.status='PENDING' OR ae.status='MANAGER_APPROVED') as pending,
          SUM(ae.status='APPROVED') as approved,
          SUM(ae.status='MANAGER_REJECTED' OR ae.status='HR_REJECTED') as rejected
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        WHERE ${where.join(' AND ')}
      `, params);

      res.json({
        statusCode: 200, data,
        metadata: {
          totalRequests: parseInt(summary.totalRequests)||0,
          pending: parseInt(summary.pending)||0,
          approved: parseInt(summary.approved)||0,
          rejected: parseInt(summary.rejected)||0,
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
        SELECT ae.id, ae.employee_id, ae.work_date, ae.type, ae.reason,
               ae.status, ae.manager_confirmation, ae.hr_comment,
               ae.approved_by_manager_id, ae.manager_approved_at,
               ae.approved_by_hr_id, ae.hr_approved_at,
               ae.rejected_by_id, ae.rejected_reason, ae.rejected_at,
               ae.created_at, ae.updated_at,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar as staff_avatar,
               mgr.full_name as manager_name,
               st.name as shift_name,
               st.start_time as shift_start_time,
               st.end_time as shift_end_time,
               wsd.check_in_time as actual_check_in,
               wsd.check_out_time as actual_check_out
        FROM hr_attendance_explanations ae
        JOIN hr_employees e ON e.id = ae.employee_id
        LEFT JOIN hr_employees mgr ON mgr.id = ae.approved_by_manager_id
        LEFT JOIN hr_work_schedule_details wsd
               ON wsd.employee_id = ae.employee_id
              AND DATE_FORMAT(wsd.work_date,'%Y-%m-%d') = DATE_FORMAT(ae.work_date,'%Y-%m-%d')
        LEFT JOIN shifts st ON st.id = wsd.shift_template_id
        WHERE ae.id = ?
      `, [req.params.id]);
      if (!row) return fail(res, 404, 'Không tìm thấy giải trình');

      const [attachments] = await db.query(
        `SELECT * FROM hr_attendance_explanation_attachments WHERE explanation_id=?`, [req.params.id]
      ).catch(() => [[]]);
      const { depts, rooms } = await getDeptRooms([row.employee_id]);
      ok(res, mapRow(row, attachments, depts, rooms));
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết giải trình', e); }
  },

  // PATCH /attendance-explanation/:id — HR duyệt/từ chối + cập nhật chấm công
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, hrComment, managerConfirmation, confirmedCheckIn, confirmedCheckOut } = req.body;

      const [[ae]] = await db.query('SELECT * FROM hr_attendance_explanations WHERE id=?', [id]);
      if (!ae) return fail(res, 404, 'Không tìm thấy đơn giải trình');

      await db.query(`
        UPDATE hr_attendance_explanations
        SET status=?, hr_comment=?, manager_confirmation=?,
            hr_approved_at = CASE WHEN ? = 'APPROVED' THEN NOW() ELSE hr_approved_at END,
            rejected_at    = CASE WHEN ? = 'HR_REJECTED' THEN NOW() ELSE rejected_at END
        WHERE id=?
      `, [status, hrComment||null, managerConfirmation||null, status, status, id]);

      if (status === 'APPROVED') {
        const workDate = ae.work_date;
        const empId    = ae.employee_id;
        const [wsds] = await db.query(`
          SELECT wsd.id, wsd.status as current_status, st.code as shift_code, st.start_time
          FROM hr_work_schedule_details wsd
          JOIN hr_work_schedules ws ON ws.id = wsd.work_schedule_id
          JOIN shifts st ON st.id = wsd.shift_template_id
          WHERE ws.employee_id = ? AND DATE_FORMAT(wsd.work_date,'%Y-%m-%d') = DATE_FORMAT(?,'%Y-%m-%d')
        `, [empId, workDate]);

        for (const wsd of wsds) {
          const dateStr = new Date(workDate).toISOString().slice(0,10);
          let checkIn  = confirmedCheckIn  ? `${dateStr} ${confirmedCheckIn}:00`  : null;
          let checkOut = confirmedCheckOut ? `${dateStr} ${confirmedCheckOut}:00` : null;
          if (!checkIn || !checkOut) {
            const code = (wsd.shift_code||'').toUpperCase();
            const st   = wsd.start_time || '07:00:00';
            if (code.includes('HC') || st.startsWith('07') || st.startsWith('08')) {
              checkIn = `${dateStr} 07:55:00`; checkOut = `${dateStr} 17:05:00`;
            } else if (st.startsWith('05') || st.startsWith('06')) {
              checkIn = `${dateStr} 05:55:00`; checkOut = `${dateStr} 14:05:00`;
            } else if (st.startsWith('13') || st.startsWith('14')) {
              checkIn = `${dateStr} 13:55:00`; checkOut = `${dateStr} 22:05:00`;
            } else {
              const next = new Date(workDate); next.setDate(next.getDate()+1);
              checkIn = `${dateStr} 21:55:00`; checkOut = `${next.toISOString().slice(0,10)} 06:05:00`;
            }
          }
          // ABSENT → PRESENT, LATE/EARLY_LEAVE → giữ status nhưng cập nhật giờ + đánh EXPLAINED
          const newStatus = ae.type === 'MISSING_CHECK_IN' ? 'PRESENT' : wsd.current_status || 'PRESENT';
          await db.query(
            `UPDATE hr_work_schedule_details SET status=?, check_in_time=?, check_out_time=? WHERE id=?`,
            [newStatus, checkIn, checkOut, wsd.id]
          );
        }
      }
      ok(res, null, status === 'APPROVED' ? 'Duyệt giải trình thành công' : 'Cập nhật giải trình thành công');
    } catch (e) { fail(res, 500, 'Lỗi cập nhật giải trình', e); }
  },

  // POST /attendance-explanation/:id/approve
  approve: async (req, res) => {
    try {
      const { managerId, comment, hrComment } = req.body;
      const [[ae]] = await db.query('SELECT * FROM hr_attendance_explanations WHERE id=?', [req.params.id]);
      if (!ae) return fail(res, 404, 'Không tìm thấy đơn giải trình');

      // Nếu đang PENDING → MANAGER_APPROVED, nếu MANAGER_APPROVED → APPROVED
      const newStatus = ae.status === 'PENDING' ? 'MANAGER_APPROVED' : 'APPROVED';
      await db.query(
        `UPDATE hr_attendance_explanations SET status=?, approved_by_manager_id=?, manager_approved_at=NOW(), hr_comment=? WHERE id=?`,
        [newStatus, managerId||null, hrComment||comment||null, req.params.id]
      );

      // Nếu APPROVED → update chấm công ngay
      if (newStatus === 'APPROVED') {
        await updateWsdAfterApprove(ae, db);
      }
      ok(res, null, 'Duyệt giải trình thành công');
    } catch (e) { fail(res, 500, 'Lỗi duyệt giải trình', e); }
  },

  // POST /attendance-explanation/:id/manager-approve
  managerApprove: async (req, res) => {
    try {
      const { hrId, comment } = req.body;
      const [[ae]] = await db.query('SELECT * FROM hr_attendance_explanations WHERE id=?', [req.params.id]);
      if (!ae) return fail(res, 404, 'Không tìm thấy đơn giải trình');
      await db.query(
        `UPDATE hr_attendance_explanations SET status='APPROVED', approved_by_hr_id=?, hr_approved_at=NOW(), hr_comment=? WHERE id=?`,
        [hrId||null, comment||null, req.params.id]
      );
      // Update chấm công
      await updateWsdAfterApprove(ae, db);
      ok(res, null, 'Phê duyệt giải trình thành công');
    } catch (e) { fail(res, 500, 'Lỗi phê duyệt giải trình', e); }
  },

  // POST /attendance-explanation/:id/reject
  reject: async (req, res) => {
    try {
      const { rejectedById, reason } = req.body;
      await db.query(
        `UPDATE hr_attendance_explanations SET status='HR_REJECTED', rejected_by_id=?, rejected_reason=?, rejected_at=NOW() WHERE id=?`,
        [rejectedById||null, reason||'', req.params.id]
      );
      ok(res, null, 'Từ chối giải trình thành công');
    } catch (e) { fail(res, 500, 'Lỗi từ chối giải trình', e); }
  },

  // POST /attendance-explanation/bulk-approve
  bulkApprove: async (req, res) => {
    try {
      const { ids, managerId } = req.body;
      if (!ids?.length) return fail(res, 400, 'Thiếu danh sách ID');
      await db.query(
        `UPDATE hr_attendance_explanations SET status='APPROVED', approved_by_hr_id=?, hr_approved_at=NOW() WHERE id IN (?)`,
        [managerId||null, ids]
      );
      ok(res, null, `Duyệt ${ids.length} giải trình thành công`);
    } catch (e) { fail(res, 500, 'Lỗi duyệt hàng loạt', e); }
  },

  // POST /attendance-explanation/seed-mock
  seedMock: async (req, res) => {
    try {
      const [emps] = await db.query(`SELECT id, employee_code, full_name FROM hr_employees WHERE status!='RESIGNED' LIMIT 3`);
      if (!emps.length) return fail(res, 400, 'Không có nhân viên nào');
      const types   = ['MISSING_CHECK_IN', 'LATE', 'MISSING_CHECK_OUT'];
      const reasons = ['Quên quẹt thẻ do bận cấp cứu ca đêm', 'Đi muộn do kẹt xe đột xuất', 'Quên quẹt thẻ ra do bàn giao ca gấp'];
      const date    = new Date().toISOString().slice(0, 10);
      const inserted = [];
      for (let i = 0; i < emps.length; i++) {
        const [r] = await db.query(
          `INSERT INTO hr_attendance_explanations (employee_id,work_date,type,reason,status,created_at) VALUES (?,?,?,?,'PENDING',NOW())`,
          [emps[i].id, date, types[i], reasons[i]]
        );
        inserted.push({ id: r.insertId, staffName: emps[i].full_name, type: types[i] });
      }
      res.json({ statusCode: 200, data: inserted, message: `Đã tạo ${inserted.length} đơn giải trình mẫu` });
    } catch (e) { fail(res, 500, 'Lỗi tạo mẫu giải trình', e); }
  },
};

ctrl.create = async (req, res) => {
  try {
    const { employeeId, workDate, type, reason } = req.body;
    if (!employeeId || !workDate || !reason) return res.status(400).json({ statusCode: 400, message: 'Thiếu thông tin giải trình' });

    // Kiểm tra đã có giải trình cho ngày này chưa
    const [[existing]] = await db.query(
      `SELECT id FROM hr_attendance_explanations WHERE employee_id=? AND work_date=? LIMIT 1`,
      [employeeId, workDate]
    );
    if (existing) return res.status(400).json({ statusCode: 400, message: 'Đã có giải trình cho ngày này rồi!' });

    const [result] = await db.query(
      `INSERT INTO hr_attendance_explanations (employee_id, work_date, type, reason, status, created_at) VALUES (?,?,?,?,'PENDING',NOW())`,
      [employeeId, workDate, type || 'OTHER', reason]
    );
    res.json({ statusCode: 200, data: { id: result.insertId }, message: 'Gửi giải trình thành công' });
  } catch(e) {
    res.status(500).json({ statusCode: 500, message: 'Lỗi gửi giải trình', error: e.message });
  }
};

module.exports = ctrl;