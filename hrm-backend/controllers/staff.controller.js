const db = require('../config/db');

const safeDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) {
    // 💡 TUYỆT ĐỐI KHÔNG DÙNG toISOString() vì sẽ bị trừ lùi 7 tiếng về UTC
    // Lấy trực tiếp Ngày/Tháng/Năm theo giờ địa phương (Local Time) của Server
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Trả về chính xác chuỗi YYYY-MM-DD local
  }
  return String(val).slice(0, 10);
};

const rawDate = (dateStr) => {
  if (!dateStr) return null;
  let s = String(dateStr);
  
  // 💡 Nếu Frontend gửi chuỗi ISO full có chứa chữ T (VD: 2004-12-25T17:00:00.000Z)
  if (s.includes('T')) {
    const d = new Date(s);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    s = `${year}-${month}-${day}`;
  } else {
    s = s.slice(0, 10); // Nếu đã là chuỗi YYYY-MM-DD sẵn thì chỉ cắt lấy 10 ký tự đầu
  }
  return { toSqlString: () => `'${s}'` }; 
};

// ── Helper response ──────────────────────────────────────────
const ok = (res, data, pagination = null, metadata = null, message = 'success') =>
  res.status(200).json({ statusCode: 200, data, pagination, metadata, message });

const fail = (res, status, message, error = null) =>
  res.status(status).json({ statusCode: status, message, error: error?.message || null });

// ── MAP: DB row → Staff type FE expect ──────────────────────
const mapStaff = (row) => ({
  id:     String(row.id),
  code:   row.employee_code,
  name:   row.full_name,
  birthday: safeDate(row.dob),
  gender: row.gender,
  phone:  row.phone,
  email:  row.email,
  avatar: row.avatar || null,
  status: row.status,
  activeStatus: row.status === 'WORKING' ? 'ACTIVE' : 'INACTIVE',
  currentWorkType: row.working_type || null,
  workType: row.working_type || null,
  currentContractType: row.contract_type || null,
  endDate: safeDate(row.contract_end_date),
  jobTitle: row.job_title_id
    ? { id: String(row.job_title_id), name: row.job_title_name || '' }
    : null,
  position: row.level_name || null,
  // Danh sách khoa làm việc
  departments: row.department_id_num
    ? [{ id: String(row.department_id_num), name: row.department_name || '', code: row.department_code }]
    : [],
  rooms: row.room_id_num
    ? [{ id: String(row.room_id_num), name: row.room_name || '', code: row.room_code }]
    : [],
  // Khoa/Phòng quản lý chính — dùng id SỐ để FE dropdown match đúng
  managedDepartment: row.department_id_num
    ? { id: String(row.department_id_num), name: row.department_name || '', code: row.department_code }
    : null,
  managedRoom: row.room_id_num
    ? { id: String(row.room_id_num), name: row.room_name || '', code: row.room_code }
    : null,
  // FE dùng 2 field này để reset workingAreas form sau khi lưu
  rlsStaffDepartments: row.department_id_num
    ? [{ id: String(row.department_id_num), department: { id: String(row.department_id_num), name: row.department_name || '', code: row.department_code } }]
    : [],
  rlsStaffRooms: row.room_id_num
    ? [{ id: String(row.room_id_num), room: { id: String(row.room_id_num), name: row.room_name || '', code: row.room_code, department: row.department_id_num ? { id: String(row.department_id_num), name: row.department_name || '' } : null } }]
    : [],
  // Detail fields
  identity: row.identity || null,
  identityIssueDate: safeDate(row.identity_issue_date),
  identityIssuePlace: row.identity_issue_place || null,
  nationality: row.nationality || null,
  address: row.address || null,
  qualification: row.qualification_level || null,
  major: row.major || null,
  academicTitles: row.academic_titles ? JSON.parse(row.academic_titles) : [],
  certificateNumber: row.certificate_number || null,
  certificateIssuePlace: row.certificate_issue_place || null,
  certificateExpiryDate: safeDate(row.certificate_expiry_date),
  taxCode: row.tax_code || null,
  insuranceNumber: row.insurance_number || null,
  healthInsuranceNumber: row.health_insurance_number || null,
  accountNumber: row.bank_account || null,
  beneficiaryName: row.bank_account_name || null,
  bankName: row.bank_name || null,
  note: row.note || null,
  emergencyContact: row.emergency_name || null,
  emergencyContactPhone: row.emergency_phone || null,
  emergencyContactAddress: row.emergency_address || null,
  emergencyContactRelationship: row.emergency_relationship || null,
});

// ── BASE SQL JOIN ────────────────────────────────────────────
const BASE_SQL = `
  SELECT
    e.id, e.employee_code, e.full_name, e.gender, e.dob,
    e.phone, e.email, e.avatar, e.status,
    e.identity, e.identity_issue_date, e.identity_issue_place,
    e.nationality, e.address, e.qualification_level, e.major,
    e.academic_titles, e.certificate_number, e.certificate_issue_place,
    e.certificate_expiry_date, e.tax_code, e.insurance_number,
    e.health_insurance_number, e.bank_account, e.bank_account_name,
    e.bank_name, e.note,
    e.emergency_name, e.emergency_phone, e.emergency_address, e.emergency_relationship,
    c.contract_type, c.working_type, c.level_name,
    c.department_code, c.room_code,
    c.end_date AS contract_end_date,
    c.job_title_code AS job_title_id,
    ct.name AS job_title_name,
    d.id    AS department_id_num,
    d.name  AS department_name,
    r.id    AS room_id_num,
    r.name  AS room_name
  FROM hr_employees e
  LEFT JOIN hr_contracts c ON c.employee_id = e.id AND c.status = 'ACTIVE'
  LEFT JOIN cat_titles ct ON ct.id = c.job_title_code
  LEFT JOIN cat_departments d ON d.code = c.department_code
  LEFT JOIN cat_rooms r ON r.code = c.room_code
`;

// Lấy danh sách khoa/phòng làm việc (nhiều) cho 1 nhân viên
async function getWorkingAreas(db, employeeId) {
  console.log('[getWorkingAreas] employeeId:', employeeId);
  const [depts] = await db.query(
    `SELECT sd.employee_id, sd.department_code, d.id AS dept_id, d.name AS dept_name
     FROM hr_staff_departments sd
     LEFT JOIN cat_departments d ON d.code = sd.department_code
     WHERE sd.employee_id = ?`,
    [employeeId]
  );
  console.log('[getWorkingAreas] depts:', JSON.stringify(depts));
  const [rooms] = await db.query(
    `SELECT sr.employee_id, sr.room_code, r.id AS room_id, r.name AS room_name,
            r.department_code
     FROM hr_staff_rooms sr
     LEFT JOIN cat_rooms r ON r.code = sr.room_code
     WHERE sr.employee_id = ?`,
    [employeeId]
  );

  // Group rooms theo department
  const deptMap = {};
  for (const d of depts) {
    deptMap[d.department_code] = {
      id: String(d.dept_id),
      name: d.dept_name || '',
      code: d.department_code,
      rooms: []
    };
  }
  for (const r of rooms) {
    if (deptMap[r.department_code]) {
      deptMap[r.department_code].rooms.push({
        id: String(r.room_id),
        name: r.room_name || '',
        code: r.room_code
      });
    }
  }

  return Object.values(deptMap);
}

// Lưu working areas vào 2 bảng hr_staff_departments và hr_staff_rooms
async function saveWorkingAreas(conn, employeeId, workingAreas) {
  console.log('[saveWorkingAreas] input:', JSON.stringify(workingAreas));
  // Xóa cũ
  await conn.query('DELETE FROM hr_staff_departments WHERE employee_id = ?', [employeeId]);
  await conn.query('DELETE FROM hr_staff_rooms WHERE employee_id = ?', [employeeId]);

  if (!workingAreas?.length) return;

  for (const area of workingAreas) {
    if (!area.departmentId) continue;
    const deptCode = await getDeptCode(conn, area.departmentId);
    if (!deptCode) continue;

    await conn.query(
      'INSERT IGNORE INTO hr_staff_departments (employee_id, department_code) VALUES (?, ?)',
      [employeeId, deptCode]
    );

    const roomIds = Array.isArray(area.roomId) ? area.roomId : (area.roomId ? [area.roomId] : []);
    for (const roomId of roomIds) {
      if (!roomId) continue;
      const roomCode = await getRoomCode(conn, roomId);
      if (roomCode) {
        await conn.query(
          'INSERT IGNORE INTO hr_staff_rooms (employee_id, room_code) VALUES (?, ?)',
          [employeeId, roomCode]
        );
      }
    }
  }
}

const staffController = {

  // GET /staff
  getAll: async (req, res) => {
    try {
      const page   = Math.max(1, parseInt(req.query.page)  || 1);
      const limit  = Math.min(100, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const search       = req.query.search || '';
      const status       = req.query.status || '';
      const contractType = req.query.contractType || '';
      const jobTitleId   = req.query.jobTitleId || '';
      const positions    = [].concat(req.query.positions || req.query['positions[]'] || []);
      const departmentIds= [].concat(req.query.departmentIds || req.query['departmentIds[]'] || []);
      const roomIds      = [].concat(req.query.roomIds || req.query['roomIds[]'] || []);

      const conditions = [];
      const params = [];

      if (search) {
        conditions.push('(e.full_name LIKE ? OR e.employee_code LIKE ? OR e.phone LIKE ? OR e.email LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (status)       { conditions.push('e.status = ?');          params.push(status); }
      if (contractType) { conditions.push('c.contract_type = ?');   params.push(contractType); }
      if (jobTitleId)   { conditions.push('c.job_title_code = ?');  params.push(jobTitleId); }
      if (positions.length > 0) {
        conditions.push(`c.level_name IN (${positions.map(() => '?').join(',')})`);
        params.push(...positions);
      }
      if (departmentIds.length > 0) {
        conditions.push(`c.department_code IN (${departmentIds.map(() => '?').join(',')})`);
        params.push(...departmentIds);
      }
      if (roomIds.length > 0) {
        conditions.push(`c.room_code IN (${roomIds.map(() => '?').join(',')})`);
        params.push(...roomIds);
      }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      const [[countRow]] = await db.query(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN e.status = 'WORKING'  THEN 1 ELSE 0 END) AS working_count,
          SUM(CASE WHEN e.status = 'RESIGNED' THEN 1 ELSE 0 END) AS resigned_count
         FROM hr_employees e
         LEFT JOIN hr_contracts c ON c.employee_id = e.id AND c.status = 'ACTIVE'
         ${where}`,
        params,
      );

      const [rows] = await db.query(
        `${BASE_SQL} ${where} ORDER BY e.id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      );

      const total     = Number(countRow.total) || 0;
      const totalPage = Math.ceil(total / limit);

      ok(res, rows.map(mapStaff), {
        page, limit, total, totalPage,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPage,
      }, {
        WORKING:  Number(countRow.working_count)  || 0,
        RESIGNED: Number(countRow.resigned_count) || 0,
      });
    } catch (e) {
      console.error('[GET /staff]', e);
      fail(res, 500, 'Lỗi lấy danh sách nhân viên', e);
    }
  },

  // GET /staff/:id
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(`${BASE_SQL} WHERE e.id = ? LIMIT 1`, [req.params.id]);
      if (!rows.length) return fail(res, 404, 'Không tìm thấy nhân viên');
      const staff = mapStaff(rows[0]);
      // Lấy danh sách khoa/phòng làm việc thực tế
      const workingAreas = await getWorkingAreas(db, rows[0].id);
      // Map sang format FE dùng cho rlsStaffDepartments
      staff.rlsStaffDepartments = workingAreas.map(d => ({
        id: d.id,
        department: { id: d.id, name: d.name, code: d.code }
      }));
      staff.rlsStaffRooms = workingAreas.flatMap(d =>
        d.rooms.map(r => ({
          id: r.id,
          room: { id: r.id, name: r.name, code: r.code,
                  department: { id: d.id, name: d.name } }
        }))
      );
      console.log('[getById] rlsStaffDepartments:', JSON.stringify(staff.rlsStaffDepartments));
      console.log('[getById] rlsStaffRooms:', JSON.stringify(staff.rlsStaffRooms));
      console.log('[getById] managedDepartment:', JSON.stringify(staff.managedDepartment));
      ok(res, staff);
    } catch (e) {
      console.error('[GET /staff/:id]', e);
      fail(res, 500, 'Lỗi lấy chi tiết nhân viên', e);
    }
  },

  // POST /staff — Tạo mới
  create: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const b = req.body;

      // Validate tuổi >= 18
      if (b.birthday) {
        const age = Math.floor((Date.now() - new Date(b.birthday)) / (365.25 * 24 * 3600 * 1000));
        if (age < 18) {
          await conn.rollback(); conn.release();
          return fail(res, 400, 'Nhân sự chưa đủ 18 tuổi');
        }
      }

      // Validate bắt buộc
      if (!b.name || !b.phone || !b.email || !b.gender || !b.birthday) {
        await conn.rollback(); conn.release();
        return fail(res, 400, 'Thiếu thông tin bắt buộc: họ tên, SĐT, email, giới tính, ngày sinh');
      }

      // Kiểm tra trùng email/phone
      const [dup] = await conn.query(
        'SELECT id FROM hr_employees WHERE phone = ? OR email = ? LIMIT 1',
        [b.phone, b.email],
      );
      if (dup.length) {
        await conn.rollback(); conn.release();
        return fail(res, 400, 'Số điện thoại hoặc Email đã tồn tại');
      }

      // Tạo mã nhân viên tự động nếu không có
      const code = b.code || await generateCode(conn);

      // Insert hr_employees
      const [empResult] = await conn.query(
        `INSERT INTO hr_employees
          (employee_code, full_name, gender, dob, phone, email,
           avatar, qualification_level, major,
           academic_titles, certificate_number, certificate_issue_place, certificate_expiry_date,
           identity, identity_issue_date, identity_issue_place, nationality, address,
           tax_code, insurance_number, health_insurance_number,
           bank_account, bank_account_name, bank_name,
           emergency_name, emergency_phone, emergency_address, emergency_relationship,
           note, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'WORKING')`,
        [
          code, b.name, b.gender, rawDate(b.birthday), b.phone, b.email,
          b.avatar || null, b.qualification || null, b.major || null,
          b.academicTitles?.length ? JSON.stringify(b.academicTitles) : null,
          b.certificateNumber || null, b.certificateIssuePlace || null, b.certificateExpiryDate || null,
          b.identity || null, b.identityIssueDate || null, b.identityIssuePlace || null,
          b.nationality || null, b.address || null,
          b.taxCode || null, b.insuranceNumber || null, b.healthInsuranceNumber || null,
          b.accountNumber || null, b.beneficiaryName || null, b.bankName || null,
          b.emergencyContact || null, b.emergencyContactPhone || null,
          b.emergencyContactAddress || null, b.emergencyContactRelationship || null,
          b.note || null,
        ],
      );

      const employeeId = empResult.insertId;

      // Insert hr_contracts nếu có thông tin hợp đồng
      if (b.contractType && b.jobTitleId) {
        // managedDepartmentId/managedRoomId là Khoa/Phòng QUẢN LÝ chính
        // workingAreas là danh sách khoa phòng làm việc (có thể nhiều)
        const managedDeptId = b.managedDepartmentId || b.workingAreas?.[0]?.departmentId;
        const managedRoomId = b.managedRoomId || b.workingAreas?.[0]?.roomId?.[0];
        const deptCode = await getDeptCode(conn, managedDeptId);
        const roomCode = await getRoomCode(conn, managedRoomId);
        console.log('[CREATE] dept:', managedDeptId, '→ code:', deptCode, '| room:', managedRoomId, '→ code:', roomCode);

        await conn.query(
          `INSERT INTO hr_contracts
            (employee_id, contract_number, contract_type, working_type,
             job_title_code, level_name, department_code, room_code,
             start_date, end_date, status)
           VALUES (?,?,?,?,?,?,?,?,CURDATE(),?,?)`,
          [
            employeeId,
            `HD${Date.now()}`,
            b.contractType,
            b.workType || 'FULL_TIME',
            b.jobTitleId,
            b.position || 'STAFF',
            deptCode || null,
            roomCode || null,
            b.endDate || '2099-12-31',
            'ACTIVE',
          ],
        );
      }

      // Lưu danh sách khoa/phòng LÀM VIỆC (nhiều)
      if (b.workingAreas?.length) {
        await saveWorkingAreas(conn, employeeId, b.workingAreas);
      }

      await conn.commit();
      conn.release();

      res.status(201).json({
        statusCode: 201,
        data: { id: String(employeeId), code },
        message: 'Tạo nhân viên thành công',
      });
    } catch (e) {
      await conn.rollback(); conn.release();
      console.error('[POST /staff]', e);
      fail(res, 500, 'Lỗi tạo nhân viên', e);
    }
  },

  // PATCH /staff/:id — Cập nhật
  update: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const { id } = req.params;
      const b = req.body;
      console.log('[PATCH /staff] id:', id, 'birthday received:', b.birthday, 'typeof:', typeof b.birthday);

      // Update hr_employees
      const empFields = [];
      const empVals   = [];

      if (b.name !== undefined)        { empFields.push('full_name = ?');           empVals.push(b.name); }
      if (b.gender !== undefined)      { empFields.push('gender = ?');              empVals.push(b.gender); }
      if (b.birthday !== undefined)    { empFields.push('dob = ?'); empVals.push(rawDate(b.birthday)); }
      if (b.phone !== undefined)       { empFields.push('phone = ?');               empVals.push(b.phone); }
      if (b.email !== undefined)       { empFields.push('email = ?');               empVals.push(b.email); }
      if (b.avatar !== undefined)      { empFields.push('avatar = ?');              empVals.push(b.avatar); }
      if (b.qualification !== undefined) { empFields.push('qualification_level = ?'); empVals.push(b.qualification); }
      if (b.major !== undefined)       { empFields.push('major = ?');               empVals.push(b.major); }
      if (b.academicTitles !== undefined) { empFields.push('academic_titles = ?'); empVals.push(b.academicTitles?.length ? JSON.stringify(b.academicTitles) : null); }
      if (b.certificateNumber !== undefined)    { empFields.push('certificate_number = ?');      empVals.push(b.certificateNumber); }
      if (b.certificateIssuePlace !== undefined){ empFields.push('certificate_issue_place = ?'); empVals.push(b.certificateIssuePlace); }
      if (b.certificateExpiryDate !== undefined){ empFields.push('certificate_expiry_date = ?'); empVals.push(b.certificateExpiryDate); }
      if (b.identity !== undefined)    { empFields.push('identity = ?');            empVals.push(b.identity); }
      if (b.identityIssueDate !== undefined) { empFields.push('identity_issue_date = ?'); empVals.push(b.identityIssueDate); }
      if (b.identityIssuePlace !== undefined){ empFields.push('identity_issue_place = ?'); empVals.push(b.identityIssuePlace); }
      if (b.nationality !== undefined) { empFields.push('nationality = ?');         empVals.push(b.nationality); }
      if (b.address !== undefined)     { empFields.push('address = ?');             empVals.push(b.address); }
      if (b.taxCode !== undefined)     { empFields.push('tax_code = ?');            empVals.push(b.taxCode); }
      if (b.insuranceNumber !== undefined) { empFields.push('insurance_number = ?'); empVals.push(b.insuranceNumber); }
      if (b.healthInsuranceNumber !== undefined) { empFields.push('health_insurance_number = ?'); empVals.push(b.healthInsuranceNumber); }
      if (b.accountNumber !== undefined)   { empFields.push('bank_account = ?');       empVals.push(b.accountNumber); }
      if (b.beneficiaryName !== undefined) { empFields.push('bank_account_name = ?');  empVals.push(b.beneficiaryName); }
      if (b.bankName !== undefined)    { empFields.push('bank_name = ?');           empVals.push(b.bankName); }
      if (b.emergencyContact !== undefined) { empFields.push('emergency_name = ?');  empVals.push(b.emergencyContact); }
      if (b.emergencyContactPhone !== undefined) { empFields.push('emergency_phone = ?'); empVals.push(b.emergencyContactPhone); }
      if (b.emergencyContactAddress !== undefined) { empFields.push('emergency_address = ?'); empVals.push(b.emergencyContactAddress); }
      if (b.emergencyContactRelationship !== undefined) { empFields.push('emergency_relationship = ?'); empVals.push(b.emergencyContactRelationship); }
      if (b.note !== undefined)        { empFields.push('note = ?');                empVals.push(b.note); }
      if (b.activeStatus !== undefined) {
        const newStatus = b.activeStatus === 'ACTIVE' ? 'WORKING' : 'RESIGNED';
        empFields.push('status = ?'); empVals.push(newStatus);
      }
      if (b.status !== undefined)      { empFields.push('status = ?');              empVals.push(b.status); }

      if (empFields.length > 0) {
        empVals.push(id);
        await conn.query(`UPDATE hr_employees SET ${empFields.join(', ')} WHERE id = ?`, empVals);

      }

      // Update hr_contracts nếu có thay đổi thông tin hợp đồng
      const cFields = [];
      const cVals   = [];

      if (b.contractType !== undefined) { cFields.push('contract_type = ?');  cVals.push(b.contractType); }
      if (b.workType !== undefined)     { cFields.push('working_type = ?');   cVals.push(b.workType); }
      if (b.jobTitleId !== undefined)   { cFields.push('job_title_code = ?'); cVals.push(b.jobTitleId); }
      if (b.position !== undefined)     { cFields.push('level_name = ?');     cVals.push(b.position); }
      if (b.endDate !== undefined)      { cFields.push('end_date = ?');       cVals.push(b.endDate); }

      // Xử lý department/room từ workingAreas hoặc managedDepartmentId/managedRoomId
      if (b.managedDepartmentId !== undefined || b.workingAreas) {
        const deptId = b.managedDepartmentId || b.workingAreas?.[0]?.departmentId;
        const deptCode = await getDeptCode(conn, deptId);
        if (deptCode) { cFields.push('department_code = ?'); cVals.push(deptCode); }
      }
      if (b.managedRoomId !== undefined || b.workingAreas) {
        const roomId = b.managedRoomId || b.workingAreas?.[0]?.roomId?.[0];
        const roomCode = await getRoomCode(conn, roomId);
        if (roomCode) { cFields.push('room_code = ?'); cVals.push(roomCode); }
      }

      if (cFields.length > 0) {
        // Kiểm tra có hợp đồng ACTIVE chưa
        const [contracts] = await conn.query(
          'SELECT id FROM hr_contracts WHERE employee_id = ? AND status = ? LIMIT 1',
          [id, 'ACTIVE'],
        );
        if (contracts.length > 0) {
          cVals.push(id);
          await conn.query(
            `UPDATE hr_contracts SET ${cFields.join(', ')} WHERE employee_id = ? AND status = 'ACTIVE'`,
            cVals,
          );
        }
      }

      // Cập nhật danh sách khoa/phòng LÀM VIỆC nếu có
      if (b.workingAreas !== undefined) {
        await saveWorkingAreas(conn, id, b.workingAreas);
      }

      await conn.commit();
      conn.release();
      ok(res, null, null, null, 'Cập nhật nhân viên thành công');
    } catch (e) {
      await conn.rollback(); conn.release();
      console.error('[PATCH /staff/:id]', e);
      fail(res, 500, 'Lỗi cập nhật nhân viên', e);
    }
  },

  // POST /staff/import
  import: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const { rows } = req.body;
      if (!Array.isArray(rows) || !rows.length) {
        await conn.rollback(); conn.release();
        return fail(res, 400, 'Không có dữ liệu import');
      }

      const genderMap = { 'Nam': 'MALE', 'Nữ': 'FEMALE', 'MALE': 'MALE', 'FEMALE': 'FEMALE', 'OTHER': 'OTHER' };
      const parseDate = (str) => {
        if (!str) return null;
        const parts = str.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        return str;
      };

      let imported = 0;
      const errors = [];

      for (const row of rows) {
        try {
          const [dup] = await conn.query(
            'SELECT id FROM hr_employees WHERE employee_code = ? OR email = ? LIMIT 1',
            [row.code, row.email],
          );
          if (dup.length) { errors.push(`${row.code}: đã tồn tại`); continue; }

          await conn.query(
            `INSERT INTO hr_employees
              (employee_code, full_name, gender, dob, phone, email, qualification_level, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'WORKING')`,
            [row.code, row.name, genderMap[row.gender] || 'MALE',
             parseDate(row.birthday), row.phone, row.email, row.qualification || null],
          );
          imported++;
        } catch (rowErr) {
          errors.push(`${row.code}: ${rowErr.message}`);
        }
      }

      await conn.commit(); conn.release();
      ok(res, { imported, errors }, null, null, `Import thành công ${imported} nhân viên`);
    } catch (e) {
      await conn.rollback(); conn.release();
      fail(res, 500, 'Lỗi import', e);
    }
  },
};

// ── Helper functions ─────────────────────────────────────────
async function generateCode(conn) {
  const [[{ max }]] = await conn.query(
    `SELECT MAX(CAST(SUBSTRING(employee_code, 3) AS UNSIGNED)) AS max
     FROM hr_employees WHERE employee_code REGEXP '^BS[0-9]+$'`
  );
  const next = (max || 0) + 1;
  return `BS${String(next).padStart(4, '0')}`;
}

// Lấy department_code từ id (có thể là id số hoặc code chữ)
async function getDeptCode(conn, deptId) {
  if (!deptId) return null;
  // Nếu là số → tìm theo id, nếu là chữ → dùng luôn làm code
  if (/^\d+$/.test(String(deptId))) {
    const [[row]] = await conn.query('SELECT code FROM cat_departments WHERE id = ? LIMIT 1', [deptId]);
    return row?.code || null;
  }
  return deptId; // đã là code rồi
}

// Lấy room_code từ id (có thể là id số hoặc code chữ)
async function getRoomCode(conn, roomId) {
  if (!roomId) return null;
  if (/^\d+$/.test(String(roomId))) {
    const [[row]] = await conn.query('SELECT code FROM cat_rooms WHERE id = ? LIMIT 1', [roomId]);
    return row?.code || null;
  }
  return roomId;
}

module.exports = staffController;