const db = require('../config/db');

// Safe date formatter - tránh lệch timezone (theo fix của Gemini)
const safeDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) {
    const year  = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day   = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (String(val).includes('T')) {
    const d = new Date(val);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  return String(val).slice(0, 10);
};

const ok  = (res, data, message = 'success') =>
  res.status(200).json({ statusCode: 200, data, message });
const fail = (res, status, message, error = null) =>
  res.status(status).json({ statusCode: status, message, error: error?.message || null });

// Tính ngày kết thúc từ ngày bắt đầu + thời hạn
function calculateEndDate(startDate, duration, durationUnit) {
  if (!startDate || !duration) return null;
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return null;
  const n = Number(duration);
  if (durationUnit === 'YEAR')  d.setFullYear(d.getFullYear() + n);
  else                          d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

// MAP: DB row → StaffContract type FE expect
const mapContract = (row) => ({
  id:             String(row.id),
  contractNumber: row.contract_number,
  contractType:   row.contract_type,
  workType:       row.working_type,
  startDate:      safeDate(row.start_date),
  endDate:        safeDate(row.end_date),
  duration:       row.duration   || null,
  durationUnit:   row.duration_unit || 'MONTH',
  status:         row.status,
  approvedAt:     safeDate(row.approved_at),
  signedAt:       safeDate(row.signed_at),
  jobTitle: row.job_title_id
    ? { id: String(row.job_title_id), name: row.job_title_name || '' }
    : null,
  position:       row.level_name || null,
  baseSalary:     row.base_salary     || 0,
  insuranceSalary:row.insurance_salary|| 0,
  managedDepartment: row.dept_id
    ? { id: String(row.dept_id), name: row.dept_name || '', code: row.department_code }
    : null,
  department: row.dept_id
    ? { id: String(row.dept_id), name: row.dept_name || '' }
    : null,
  managedRoom: row.room_id
    ? { id: String(row.room_id), name: row.room_name || '', code: row.room_code }
    : null,
  shiftType:      row.shift_type      || null,
  fixedShiftId:   row.fixed_shift_id  ? String(row.fixed_shift_id) : null,
  workingTime:    row.working_time    || null,
  workingTimeUnit:row.working_time_unit || 'DAY',
  workingDays:    row.working_days ? JSON.parse(row.working_days) : [],
  directManagerIds: row.direct_manager_ids ? JSON.parse(row.direct_manager_ids) : [],
  // Staff info - FE dùng để hiển thị mã NV và tên NV trong bảng lịch sử
  staff: {
    id:   String(row.employee_id),
    code: row.staff_code || '',
    name: row.staff_name || '',
  },
  // FE dùng departments/rooms để map workingAreas trong form
  departments: row.dept_id
    ? [{ id: String(row.dept_id), name: row.dept_name || '' }]
    : [],
  rooms: row.room_id
    ? [{ id: String(row.room_id), name: row.room_name || '', departmentId: String(row.dept_id || '') }]
    : [],
  // FE dùng staffWorkHistory để hiển thị bảng lịch sử - map chính contract này thành 1 item
  staffWorkHistory: [{
    id:             String(row.id),
    contractNumber: row.contract_number,
    contractType:   row.contract_type,
    workType:       row.working_type,
    startDate:      safeDate(row.start_date),
    endDate:        safeDate(row.end_date),
    duration:       row.duration || null,
    durationUnit:   row.duration_unit || 'MONTH',
    contractStatus: row.status,
    jobTitle: row.job_title_id
      ? { id: String(row.job_title_id), name: row.job_title_name || '' }
      : null,
    position:       row.level_name || null,
    createdAt:      row.created_at || null,
    updatedAt:      row.updated_at || null,
  }],
});

const BASE_JOIN = `
  FROM hr_contracts c
  LEFT JOIN hr_employees e   ON e.id = c.employee_id
  LEFT JOIN cat_titles ct    ON ct.id = c.job_title_code
  LEFT JOIN cat_departments d ON d.code = c.department_code
  LEFT JOIN cat_rooms r      ON r.code = c.room_code
`;

const staffContractController = {

  // GET /staff-contract/staff/:staffId
  getByStaff: async (req, res) => {
    try {
      const { staffId } = req.params;
      const [rows] = await db.query(
        `SELECT c.*,
          ct.id AS job_title_id, ct.name AS job_title_name,
          d.id AS dept_id, d.name AS dept_name,
          r.id AS room_id, r.name AS room_name,
          e.employee_code AS staff_code, e.full_name AS staff_name
         ${BASE_JOIN}
         WHERE c.employee_id = ?
         ORDER BY c.id DESC`,
        [staffId]
      );

      // Lấy danh sách khoa/phòng LÀM VIỆC từ hr_staff_departments và hr_staff_rooms
      // (giống như tab thông tin nhân viên - đây là nguồn dữ liệu gốc)
      const [staffDepts] = await db.query(
        `SELECT sd.department_code, d.id AS dept_id, d.name AS dept_name
         FROM hr_staff_departments sd
         LEFT JOIN cat_departments d ON d.code = sd.department_code
         WHERE sd.employee_id = ?`,
        [staffId]
      );
      const [staffRooms] = await db.query(
        `SELECT sr.room_code, r.id AS room_id, r.name AS room_name, r.department_code
         FROM hr_staff_rooms sr
         LEFT JOIN cat_rooms r ON r.code = sr.room_code
         WHERE sr.employee_id = ?`,
        [staffId]
      );

      // Map thành format FE dùng
      const departments = staffDepts.map(d => ({
        id: String(d.dept_id),
        name: d.dept_name || ''
      }));
      const rooms = staffRooms.map(r => ({
        id: String(r.room_id),
        name: r.room_name || '',
        departmentId: String(
          staffDepts.find(d => d.department_code === r.department_code)?.dept_id || ''
        )
      }));

      console.log('[getByStaff] staffId:', staffId, 'staffDepts:', JSON.stringify(staffDepts), 'staffRooms:', JSON.stringify(staffRooms));
      const contracts = rows.map(row => ({
        ...mapContract(row),
        // Ghi đè departments/rooms bằng data thực từ hr_staff_departments/rooms
        departments,
        rooms,
      }));

      ok(res, contracts);
    } catch (e) {
      fail(res, 500, 'Lỗi lấy danh sách hợp đồng', e);
    }
  },

  // GET /staff-contract/:id
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT c.*,
          ct.id AS job_title_id, ct.name AS job_title_name,
          d.id AS dept_id, d.name AS dept_name,
          r.id AS room_id, r.name AS room_name,
          e.employee_code AS staff_code, e.full_name AS staff_name
         ${BASE_JOIN}
         WHERE c.id = ? LIMIT 1`,
        [req.params.id]
      );
      if (!rows.length) return fail(res, 404, 'Không tìm thấy hợp đồng');

      const contract = mapContract(rows[0]);
      const staffId = rows[0].employee_id;

      // Lấy khoa/phòng LÀM VIỆC từ hr_staff_departments/rooms (nguồn gốc thực)
      const [staffDepts] = await db.query(
        `SELECT sd.department_code, d.id AS dept_id, d.name AS dept_name
         FROM hr_staff_departments sd
         LEFT JOIN cat_departments d ON d.code = sd.department_code
         WHERE sd.employee_id = ?`, [staffId]
      );
      const [staffRooms] = await db.query(
        `SELECT sr.room_code, r.id AS room_id, r.name AS room_name, r.department_code
         FROM hr_staff_rooms sr
         LEFT JOIN cat_rooms r ON r.code = sr.room_code
         WHERE sr.employee_id = ?`, [staffId]
      );

      contract.departments = staffDepts.map(d => ({ id: String(d.dept_id), name: d.dept_name || '' }));
      contract.rooms = staffRooms.map(r => ({
        id: String(r.room_id), name: r.room_name || '',
        departmentId: String(staffDepts.find(d => d.department_code === r.department_code)?.dept_id || '')
      }));

      ok(res, contract);
    } catch (e) {
      fail(res, 500, 'Lỗi lấy chi tiết hợp đồng', e);
    }
  },

  // POST /staff-contract — Tạo hợp đồng mới
  create: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const b = req.body;

      if (!b.staffId || !b.contractType) {
        await conn.rollback(); conn.release();
        return fail(res, 400, 'Thiếu staffId hoặc contractType');
      }

      // Lấy department_code và room_code từ id
      const deptCode = await getDeptCode(conn, b.managedDepartmentId);
      const roomCode = await getRoomCode(conn, b.managedRoomId);

      const [result] = await conn.query(
        `INSERT INTO hr_contracts
          (employee_id, contract_number, contract_type, working_type,
           job_title_code, level_name, department_code, room_code,
           start_date, end_date, base_salary, insurance_salary,
           duration, duration_unit, shift_type, fixed_shift_id, working_time, working_time_unit,
           working_days, direct_manager_ids, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          b.staffId,
          b.contractNumber || `HD${Date.now()}`,
          b.contractType,
          b.workType || 'FULL_TIME',
          b.jobTitleId || null,
          b.position   || 'STAFF',
          deptCode     || null,
          roomCode     || null,
          b.startDate  || null,
          // Tự tính endDate từ duration nếu không có
          b.endDate || calculateEndDate(b.startDate, b.duration, b.durationUnit) || null,
          b.baseSalary || 0,
          b.insuranceSalary || 0,
          b.duration   || null,
          b.durationUnit || 'MONTH',
          b.shiftType  || null,
          b.fixedShiftId || null,
          b.workingTime || null,
          b.workingTimeUnit || 'DAY',
          b.workingDays ? JSON.stringify(b.workingDays) : null,
          b.directManagerIds ? JSON.stringify(b.directManagerIds) : null,
          'PENDING_APPROVAL',
        ]
      );

      await conn.commit(); conn.release();
      res.status(201).json({
        statusCode: 201,
        data: { id: String(result.insertId) },
        message: 'Tạo hợp đồng thành công'
      });
    } catch (e) {
      await conn.rollback(); conn.release();
      fail(res, 500, 'Lỗi tạo hợp đồng', e);
    }
  },

  // PATCH /staff-contract/:id — Cập nhật hợp đồng
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const b = req.body;

      const fields = [];
      const vals   = [];

      if (b.contractType !== undefined)  { fields.push('contract_type = ?');  vals.push(b.contractType); }
      if (b.workType !== undefined)      { fields.push('working_type = ?');   vals.push(b.workType); }
      if (b.jobTitleId !== undefined)    { fields.push('job_title_code = ?'); vals.push(b.jobTitleId); }
      if (b.position !== undefined)      { fields.push('level_name = ?');     vals.push(b.position); }
      if (b.startDate !== undefined)     { fields.push('start_date = ?');     vals.push(b.startDate); }
      if (b.endDate !== undefined)       { fields.push('end_date = ?');       vals.push(b.endDate); }
      if (b.baseSalary !== undefined)    { fields.push('base_salary = ?');    vals.push(b.baseSalary); }
      if (b.insuranceSalary !== undefined){ fields.push('insurance_salary = ?'); vals.push(b.insuranceSalary); }
      if (b.contractNumber !== undefined){ fields.push('contract_number = ?');vals.push(b.contractNumber); }
      if (b.duration !== undefined)      { fields.push('duration = ?');       vals.push(b.duration); }
      if (b.durationUnit !== undefined)  { fields.push('duration_unit = ?');  vals.push(b.durationUnit); }
      if (b.shiftType !== undefined)     { fields.push('shift_type = ?');     vals.push(b.shiftType); }
      if (b.workingTime !== undefined)   { fields.push('working_time = ?');   vals.push(b.workingTime); }
      if (b.workingTimeUnit !== undefined){ fields.push('working_time_unit = ?'); vals.push(b.workingTimeUnit); }
      if (b.workingDays !== undefined)    { fields.push('working_days = ?');          vals.push(JSON.stringify(b.workingDays)); }
      if (b.fixedShiftId !== undefined)   { fields.push('fixed_shift_id = ?');        vals.push(b.fixedShiftId || null); }
      if (b.directManagerIds !== undefined){ fields.push('direct_manager_ids = ?');   vals.push(JSON.stringify(b.directManagerIds || [])); }
      if (b.managedDepartmentId !== undefined) {
        const conn2 = await db.getConnection();
        const code = await getDeptCode(conn2, b.managedDepartmentId); conn2.release();
        if (code) { fields.push('department_code = ?'); vals.push(code); }
      }
      if (b.managedRoomId !== undefined) {
        const conn2 = await db.getConnection();
        const code = await getRoomCode(conn2, b.managedRoomId); conn2.release();
        if (code) { fields.push('room_code = ?'); vals.push(code); }
      }

      if (fields.length) {
        vals.push(id);
        await db.query(`UPDATE hr_contracts SET ${fields.join(', ')} WHERE id = ?`, vals);
      }

      // Cập nhật hr_staff_departments và hr_staff_rooms nếu có workingAreas
      if (b.workingAreas !== undefined) {
        // Lấy employee_id từ contract
        const [[contract]] = await db.query('SELECT employee_id FROM hr_contracts WHERE id = ?', [id]);
        if (contract) {
          const conn2 = await db.getConnection();
          try {
            // Xóa cũ
            await conn2.query('DELETE FROM hr_staff_departments WHERE employee_id = ?', [contract.employee_id]);
            await conn2.query('DELETE FROM hr_staff_rooms WHERE employee_id = ?', [contract.employee_id]);
            // Insert mới
            for (const area of b.workingAreas) {
              if (!area.departmentId) continue;
              const deptCode = await getDeptCode(conn2, area.departmentId);
              if (!deptCode) continue;
              await conn2.query(
                'INSERT IGNORE INTO hr_staff_departments (employee_id, department_code) VALUES (?, ?)',
                [contract.employee_id, deptCode]
              );
              const roomIds = Array.isArray(area.roomId) ? area.roomId : (area.roomId ? [area.roomId] : []);
              for (const roomId of roomIds) {
                const roomCode = await getRoomCode(conn2, roomId);
                if (roomCode) await conn2.query(
                  'INSERT IGNORE INTO hr_staff_rooms (employee_id, room_code) VALUES (?, ?)',
                  [contract.employee_id, roomCode]
                );
              }
            }
          } finally {
            conn2.release();
          }
        }
      }

      ok(res, null, 'Cập nhật hợp đồng thành công');
    } catch (e) {
      fail(res, 500, 'Lỗi cập nhật hợp đồng', e);
    }
  },

  // POST /staff-contract/:id/approve
  approve: async (req, res) => {
    try {
      await db.query(
        `UPDATE hr_contracts SET status = 'PENDING_SIGNATURE', approved_at = NOW() WHERE id = ?`,
        [req.params.id]
      );
      ok(res, true, 'Duyệt hợp đồng thành công');
    } catch (e) {
      fail(res, 500, 'Lỗi duyệt hợp đồng', e);
    }
  },

  // POST /staff-contract/:id/sign
  sign: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const { id } = req.params;

      // Lấy thông tin hợp đồng cần ký
      const [[contract]] = await conn.query(
        'SELECT employee_id FROM hr_contracts WHERE id = ?', [id]
      );
      if (!contract) {
        await conn.rollback(); conn.release();
        return fail(res, 404, 'Không tìm thấy hợp đồng');
      }

      // Đóng tất cả hợp đồng ACTIVE cũ
      await conn.query(
        `UPDATE hr_contracts SET status = 'EXPIRED', end_date = CURDATE()
         WHERE employee_id = ? AND status = 'ACTIVE' AND id != ?`,
        [contract.employee_id, id]
      );

      // Ký hợp đồng mới → ACTIVE
      await conn.query(
        `UPDATE hr_contracts SET status = 'ACTIVE', signed_at = NOW() WHERE id = ?`,
        [id]
      );

      // Cập nhật thông tin hợp đồng vào employee (khoa/phòng mới)
      const [[newContract]] = await conn.query(
        'SELECT * FROM hr_contracts WHERE id = ?', [id]
      );
      if (newContract) {
        await conn.query(
          `UPDATE hr_contracts SET department_code = ?, room_code = ?, job_title_code = ?, level_name = ?
           WHERE id = ?`,
          [newContract.department_code, newContract.room_code,
           newContract.job_title_code, newContract.level_name, id]
        );
      }

      await conn.commit(); conn.release();
      ok(res, true, 'Ký hợp đồng thành công');
    } catch (e) {
      await conn.rollback(); conn.release();
      fail(res, 500, 'Lỗi ký hợp đồng', e);
    }
  },

  // DELETE /staff-contract/:id
  delete: async (req, res) => {
    try {
      const [[c]] = await db.query(
        'SELECT status FROM hr_contracts WHERE id = ?', [req.params.id]
      );
      if (c?.status === 'ACTIVE') {
        return fail(res, 400, 'Không thể xóa hợp đồng đang ACTIVE');
      }
      await db.query('DELETE FROM hr_contracts WHERE id = ?', [req.params.id]);
      ok(res, true, 'Xóa hợp đồng thành công');
    } catch (e) {
      fail(res, 500, 'Lỗi xóa hợp đồng', e);
    }
  },
};

// Helpers
async function getDeptCode(conn, deptId) {
  if (!deptId) return null;
  if (/^\d+$/.test(String(deptId))) {
    const [[row]] = await conn.query('SELECT code FROM cat_departments WHERE id = ? LIMIT 1', [deptId]);
    return row?.code || null;
  }
  return deptId;
}
async function getRoomCode(conn, roomId) {
  if (!roomId) return null;
  if (/^\d+$/.test(String(roomId))) {
    const [[row]] = await conn.query('SELECT code FROM cat_rooms WHERE id = ? LIMIT 1', [roomId]);
    return row?.code || null;
  }
  return roomId;
}

module.exports = staffContractController;