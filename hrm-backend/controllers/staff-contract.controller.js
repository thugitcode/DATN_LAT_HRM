const db = require('../config/db');

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

const ok   = (res, data, message = 'success') =>
  res.status(200).json({ statusCode: 200, data, message });
const fail = (res, status, message, error = null) =>
  res.status(status).json({ statusCode: status, message, error: error?.message || null });

function calculateEndDate(startDate, duration, durationUnit) {
  if (!startDate || !duration) return null;
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return null;
  const n = Number(duration);
  if (durationUnit === 'YEAR') d.setFullYear(d.getFullYear() + n);
  else d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

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
  position:        row.level_name || null,
  baseSalary:      row.base_salary     || 0,
  insuranceSalary: row.insurance_salary|| 0,
  managedDepartment: row.dept_id
    ? { id: String(row.dept_id), name: row.dept_name || '', code: row.department_code }
    : null,
  department: row.dept_id ? { id: String(row.dept_id), name: row.dept_name || '' } : null,
  managedRoom: row.room_id
    ? { id: String(row.room_id), name: row.room_name || '', code: row.room_code }
    : null,
  shiftType:        row.shift_type       || null,
  fixedShiftId:     row.fixed_shift_id   ? String(row.fixed_shift_id) : null,
  workingTime:      row.working_time     || null,
  workingTimeUnit:  row.working_time_unit || 'DAY',
  workingDays:      row.working_days ? JSON.parse(row.working_days) : [],
  directManagerIds: row.direct_manager_ids ? JSON.parse(row.direct_manager_ids) : [],
  staff: {
    id:   String(row.employee_id),
    code: row.staff_code || '',
    name: row.staff_name || '',
  },
  salary: {
    hasHealthInsurance:        row.has_health_insurance === 1,
    healthInsuranceRate:       row.health_insurance_rate || 1.5,
    hasSocialInsurance:        row.has_social_insurance === 1,
    socialInsuranceRate:       row.social_insurance_rate || 8,
    hasUnemploymentInsurance:  row.has_unemployment_insurance === 1,
    unemploymentInsuranceRate: row.unemployment_insurance_rate || 1,
    hasUnionFee:               row.has_union_fee === 1,
    unionFee:                  row.union_fee || 0,
    hasHealthCareInsurance:    row.has_healthcare_insurance === 1,
    healthCareInsuranceCompany:row.insurance_company || '',
    healthCareInsuranceBenefit:row.benefit_level || 0,
    healthCareInsuranceRate:   row.healthcare_insurance || 0,
    hasFamilyDeduction:        row.family_deduction === 1,
    dependentsCount:           row.dependents_count || 0,
    hasPersonalIncomeTax:      row.has_personal_income_tax === 1,
    personalIncomeTaxRate:     row.tax_rate || 0,
    basicSalary:               row.base_salary || 0,
    insuranceSalary:           row.insurance_salary || 0,
    responsibilityAllowance:   row.responsibility_allowance || 0,
    positionAllowance:         row.position_allowance || 0,
    hazardAllowance:           row.hazard_allowance || 0,
    mealAllowance:             row.meal_allowance || 0,
    mealAllowanceUnit:         row.meal_allowance_unit || 'DAY',
    fuelAllowance:             row.fuel_allowance || 0,
    phoneAllowance:            row.phone_allowance || 0,
    businessTripAllowance:     row.business_trip_allowance || 0,
    otherAllowance:            row.other_allowance || 0,
    salaryType:                row.ss_salary_type || 'NET',
    netSalary:                 row.ss_net_salary || 0,
    grossSalary:               row.ss_gross_salary || 0,
    leaveQuotaIds:             row.leave_quota_ids ? String(row.leave_quota_ids).split(',').filter(Boolean) : [],
  },
  departments: [],
  rooms: [],
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
    jobTitle: row.job_title_id ? { id: String(row.job_title_id), name: row.job_title_name || '' } : null,
    position:       row.level_name || null,
    createdAt:      row.created_at || null,
    updatedAt:      row.updated_at || null,
  }],
});

const SALARY_SELECT = `
  ss.responsibility_allowance, ss.position_allowance, ss.hazard_allowance,
  ss.meal_allowance, ss.meal_allowance_unit, ss.fuel_allowance, ss.phone_allowance,
  ss.business_trip_allowance, ss.other_allowance,
  ss.has_health_insurance, ss.health_insurance_rate,
  ss.has_social_insurance, ss.social_insurance_rate,
  ss.has_unemployment_insurance, ss.unemployment_insurance_rate,
  ss.has_union_fee, ss.union_fee,
  ss.has_healthcare_insurance, ss.insurance_company, ss.benefit_level, ss.healthcare_insurance,
  ss.family_deduction, ss.dependents_count, ss.has_personal_income_tax, ss.tax_rate,
  ss.salary_type AS ss_salary_type, ss.net_salary AS ss_net_salary, ss.gross_salary AS ss_gross_salary
`;

const BASE_JOIN = `
  FROM hr_contracts c
  LEFT JOIN hr_employees e    ON e.id = c.employee_id
  LEFT JOIN cat_titles ct     ON ct.id = c.job_title_code
  LEFT JOIN cat_departments d ON d.code = c.department_code
  LEFT JOIN cat_rooms r       ON r.code = c.room_code
  LEFT JOIN hr_staff_salary ss ON ss.employee_id = c.employee_id
`;

async function getStaffDepts(empId) {
  const [depts] = await db.query(
    `SELECT sd.department_code, d.id AS dept_id, d.name AS dept_name
     FROM hr_staff_departments sd
     LEFT JOIN cat_departments d ON d.code = sd.department_code
     WHERE sd.employee_id = ?`, [empId]
  );
  const [rooms] = await db.query(
    `SELECT sr.room_code, r.id AS room_id, r.name AS room_name, r.department_code
     FROM hr_staff_rooms sr
     LEFT JOIN cat_rooms r ON r.code = sr.room_code
     WHERE sr.employee_id = ?`, [empId]
  );
  return {
    departments: depts.map(d => ({ id: String(d.dept_id), name: d.dept_name || '' })),
    rooms: rooms.map(r => ({
      id: String(r.room_id), name: r.room_name || '',
      departmentId: String(depts.find(d => d.department_code === r.department_code)?.dept_id || '')
    }))
  };
}

const staffContractController = {

  getByStaff: async (req, res) => {
    try {
      const { staffId } = req.params;
      const [rows] = await db.query(
        `SELECT c.*, ${SALARY_SELECT},
          (SELECT GROUP_CONCAT(leave_quota_id) FROM hr_staff_leave_quotas WHERE employee_id = c.employee_id) AS leave_quota_ids,
          ct.id AS job_title_id, ct.name AS job_title_name,
          d.id AS dept_id, d.name AS dept_name,
          r.id AS room_id, r.name AS room_name,
          e.employee_code AS staff_code, e.full_name AS staff_name
         ${BASE_JOIN}
         WHERE c.employee_id = ?
         ORDER BY c.id DESC`, [staffId]
      );
      const { departments, rooms } = await getStaffDepts(staffId);
      const contracts = rows.map(row => ({ ...mapContract(row), departments, rooms }));
      ok(res, contracts);
    } catch (e) {
      fail(res, 500, 'Lỗi lấy danh sách hợp đồng', e);
    }
  },

  getById: async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT c.*, ${SALARY_SELECT},
          (SELECT GROUP_CONCAT(leave_quota_id) FROM hr_staff_leave_quotas WHERE employee_id = c.employee_id) AS leave_quota_ids,
          ct.id AS job_title_id, ct.name AS job_title_name,
          d.id AS dept_id, d.name AS dept_name,
          r.id AS room_id, r.name AS room_name,
          e.employee_code AS staff_code, e.full_name AS staff_name
         ${BASE_JOIN}
         WHERE c.id = ? LIMIT 1`, [req.params.id]
      );
      if (!rows.length) return fail(res, 404, 'Không tìm thấy hợp đồng');
      const contract = mapContract(rows[0]);
      const { departments, rooms } = await getStaffDepts(rows[0].employee_id);
      contract.departments = departments;
      contract.rooms = rooms;
      ok(res, contract);
    } catch (e) {
      fail(res, 500, 'Lỗi lấy chi tiết hợp đồng', e);
    }
  },

  create: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const b = req.body;
      if (!b.staffId || !b.contractType) {
        await conn.rollback(); conn.release();
        return fail(res, 400, 'Thiếu staffId hoặc contractType');
      }
      const deptCode = await getDeptCode(conn, b.managedDepartmentId);
      const roomCode = await getRoomCode(conn, b.managedRoomId);
      const [result] = await conn.query(
        `INSERT INTO hr_contracts
          (employee_id, contract_number, contract_type, working_type,
           job_title_code, level_name, department_code, room_code,
           start_date, end_date, base_salary, insurance_salary,
           duration, duration_unit, shift_type, fixed_shift_id,
           working_time, working_time_unit, working_days, direct_manager_ids, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          b.staffId, b.contractNumber || `HD${Date.now()}`,
          b.contractType, b.workType || 'FULL_TIME',
          b.jobTitleId || null, b.position || 'STAFF',
          deptCode || null, roomCode || null,
          b.startDate || null,
          b.endDate || calculateEndDate(b.startDate, b.duration, b.durationUnit) || null,
          b.salary?.basicSalary || b.baseSalary || 0,
          b.salary?.insuranceSalary || b.insuranceSalary || 0,
          b.duration || null, b.durationUnit || 'MONTH',
          b.shiftType || null, b.fixedShiftId || null,
          b.workingTime || null, b.workingTimeUnit || 'DAY',
          b.workingDays ? JSON.stringify(b.workingDays) : null,
          b.directManagerIds ? JSON.stringify(b.directManagerIds) : null,
          'PENDING_APPROVAL',
        ]
      );
      await conn.commit(); conn.release();
      res.status(201).json({ statusCode: 201, data: { id: String(result.insertId) }, message: 'Tạo hợp đồng thành công' });
    } catch (e) {
      await conn.rollback(); conn.release();
      fail(res, 500, 'Lỗi tạo hợp đồng', e);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const b = req.body;
      const salary = b.salary;

      // Update hr_contracts
      const fields = []; const vals = [];
      if (b.contractType !== undefined)   { fields.push('contract_type = ?');    vals.push(b.contractType); }
      if (b.workType !== undefined)       { fields.push('working_type = ?');     vals.push(b.workType); }
      if (b.jobTitleId !== undefined)     { fields.push('job_title_code = ?');   vals.push(b.jobTitleId); }
      if (b.position !== undefined)       { fields.push('level_name = ?');       vals.push(b.position); }
      if (b.startDate !== undefined)      { fields.push('start_date = ?');       vals.push(b.startDate); }
      if (b.endDate !== undefined)        { fields.push('end_date = ?');         vals.push(b.endDate); }
      if (b.contractNumber !== undefined) { fields.push('contract_number = ?');  vals.push(b.contractNumber); }
      if (b.duration !== undefined)       { fields.push('duration = ?');         vals.push(b.duration); }
      if (b.durationUnit !== undefined)   { fields.push('duration_unit = ?');    vals.push(b.durationUnit); }
      if (b.shiftType !== undefined)      { fields.push('shift_type = ?');       vals.push(b.shiftType); }
      if (b.workingTime !== undefined)    { fields.push('working_time = ?');     vals.push(b.workingTime); }
      if (b.workingTimeUnit !== undefined){ fields.push('working_time_unit = ?');vals.push(b.workingTimeUnit); }
      if (b.workingDays !== undefined)    { fields.push('working_days = ?');     vals.push(JSON.stringify(b.workingDays)); }
      if (b.fixedShiftId !== undefined)   { fields.push('fixed_shift_id = ?');   vals.push(b.fixedShiftId || null); }
      if (b.directManagerIds !== undefined){ fields.push('direct_manager_ids = ?'); vals.push(JSON.stringify(b.directManagerIds || [])); }
      // Lương cơ bản từ salary object hoặc trực tiếp
      const basicSalary = salary?.basicSalary ?? b.baseSalary;
      const insuranceSalary = salary?.insuranceSalary ?? b.insuranceSalary;
      if (basicSalary !== undefined)    { fields.push('base_salary = ?');      vals.push(parseFloat(basicSalary) || 0); }
      if (insuranceSalary !== undefined){ fields.push('insurance_salary = ?'); vals.push(parseFloat(insuranceSalary) || 0); }

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

      // Lấy employee_id từ contract
      const [[contract]] = await db.query('SELECT employee_id FROM hr_contracts WHERE id = ?', [id]);
      if (!contract) return fail(res, 404, 'Không tìm thấy hợp đồng');
      const empId = contract.employee_id;

      // Update workingAreas
      if (b.workingAreas !== undefined) {
        const conn2 = await db.getConnection();
        try {
          await conn2.query('DELETE FROM hr_staff_departments WHERE employee_id = ?', [empId]);
          await conn2.query('DELETE FROM hr_staff_rooms WHERE employee_id = ?', [empId]);
          for (const area of b.workingAreas) {
            if (!area.departmentId) continue;
            const deptCode = await getDeptCode(conn2, area.departmentId);
            if (!deptCode) continue;
            await conn2.query('INSERT IGNORE INTO hr_staff_departments (employee_id, department_code) VALUES (?, ?)', [empId, deptCode]);
            const roomIds = Array.isArray(area.roomId) ? area.roomId : (area.roomId ? [area.roomId] : []);
            for (const roomId of roomIds) {
              const roomCode = await getRoomCode(conn2, roomId);
              if (roomCode) await conn2.query('INSERT IGNORE INTO hr_staff_rooms (employee_id, room_code) VALUES (?, ?)', [empId, roomCode]);
            }
          }
        } finally { conn2.release(); }
      }

      // Upsert hr_staff_salary
      // Tab Hợp đồng chỉ upsert lương + phụ cấp, KHÔNG ghi đè thuế/bảo hiểm
      if (salary) {
        await db.query(
          `INSERT INTO hr_staff_salary (
            employee_id, responsibility_allowance, position_allowance, hazard_allowance,
            meal_allowance, meal_allowance_unit, fuel_allowance, phone_allowance,
            business_trip_allowance, other_allowance, salary_type, net_salary, gross_salary
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
            responsibility_allowance=VALUES(responsibility_allowance),
            position_allowance=VALUES(position_allowance),
            hazard_allowance=VALUES(hazard_allowance),
            meal_allowance=VALUES(meal_allowance),
            meal_allowance_unit=VALUES(meal_allowance_unit),
            fuel_allowance=VALUES(fuel_allowance),
            phone_allowance=VALUES(phone_allowance),
            business_trip_allowance=VALUES(business_trip_allowance),
            other_allowance=VALUES(other_allowance),
            salary_type=VALUES(salary_type),
            net_salary=VALUES(net_salary),
            gross_salary=VALUES(gross_salary)`,
          [
            empId,
            parseFloat(salary.responsibilityAllowance) || 0,
            parseFloat(salary.positionAllowance) || 0,
            parseFloat(salary.hazardAllowance) || 0,
            parseFloat(salary.mealAllowance) || 0,
            salary.mealAllowanceUnit || 'DAY',
            parseFloat(salary.fuelAllowance) || 0,
            parseFloat(salary.phoneAllowance) || 0,
            parseFloat(salary.businessTripAllowance) || 0,
            parseFloat(salary.otherAllowance) || 0,
            salary.salaryType || 'NET',
            parseFloat(salary.netSalary) || 0,
            parseFloat(salary.grossSalary) || 0,
          ]
        );
      }

      ok(res, null, 'Cập nhật hợp đồng thành công');
    } catch (e) {
      fail(res, 500, 'Lỗi cập nhật hợp đồng', e);
    }
  },

  approve: async (req, res) => {
    try {
      await db.query(`UPDATE hr_contracts SET status = 'PENDING_SIGNATURE', approved_at = NOW() WHERE id = ?`, [req.params.id]);
      ok(res, true, 'Duyệt hợp đồng thành công');
    } catch (e) { fail(res, 500, 'Lỗi duyệt hợp đồng', e); }
  },

  sign: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const { id } = req.params;
      const [[contract]] = await conn.query('SELECT employee_id FROM hr_contracts WHERE id = ?', [id]);
      if (!contract) { await conn.rollback(); conn.release(); return fail(res, 404, 'Không tìm thấy hợp đồng'); }
      await conn.query(`UPDATE hr_contracts SET status = 'EXPIRED', end_date = CURDATE() WHERE employee_id = ? AND status = 'ACTIVE' AND id != ?`, [contract.employee_id, id]);
      await conn.query(`UPDATE hr_contracts SET status = 'ACTIVE', signed_at = NOW() WHERE id = ?`, [id]);
      await conn.commit(); conn.release();
      ok(res, true, 'Ký hợp đồng thành công');
    } catch (e) {
      await conn.rollback(); conn.release();
      fail(res, 500, 'Lỗi ký hợp đồng', e);
    }
  },

  delete: async (req, res) => {
    try {
      const [[c]] = await db.query('SELECT status FROM hr_contracts WHERE id = ?', [req.params.id]);
      if (c?.status === 'ACTIVE') return fail(res, 400, 'Không thể xóa hợp đồng đang ACTIVE');
      await db.query('DELETE FROM hr_contracts WHERE id = ?', [req.params.id]);
      ok(res, true, 'Xóa hợp đồng thành công');
    } catch (e) { fail(res, 500, 'Lỗi xóa hợp đồng', e); }
  },
};

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