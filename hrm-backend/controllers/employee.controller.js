const db = require('../config/db');

// Hàm sinh mật khẩu ngẫu nhiên chuẩn bảo mật cao (Chữ hoa, thường, số, ký tự đặc biệt)
const generateSecurePassword = () => {
  const uppercase = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "@#$!%*?&";
  const all = uppercase + lowercase + numbers + specials;
  
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specials[Math.floor(Math.random() * specials.length)];
  
  for (let i = 0; i < 4; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const employeeController = {
  // 1. GET: Lấy danh sách nhân sự bốc theo Tab Hợp đồng và Bộ lọc "VẠN NĂNG" tương thích 100% FE có sẵn
  getEmployeesByTab: async (req, res) => {
    try {
      // BỘ ĐỌC LINH HOẠT: FE gửi biến nào lên hệ thống cũng bắt được hết
      const incomingTab = req.query.tabType || req.query.tab || req.query.type || req.query.contract_type || req.query.contractType || '';
      const search = req.query.search || req.query.q || req.query.keyword || '';
      const position = req.query.position || req.query.title_name || '';
      const department_code = req.query.department_code || req.query.department || '';

      let contractType = 'CHINH_THUC';
      const lowerTab = incomingTab ? incomingTab.toString().toLowerCase() : '';
      
      if (lowerTab.includes('probation') || lowerTab.includes('thử việc') || lowerTab === 'thu_viec') {
        contractType = 'THU_VIEC';
      } else if (lowerTab.includes('intern') || lowerTab.includes('học việc') || lowerTab === 'hoc_viec') {
        contractType = 'HOC_VIEC';
      } else if (lowerTab.includes('expert') || lowerTab.includes('hợp tác') || lowerTab === 'hop_tac') {
        contractType = 'HOP_TAC';
      }

      let sql = `
        SELECT 
          e.id, e.employee_code, e.full_name, e.gender, e.dob, e.phone, e.email, e.status,
          c.contract_number, c.contract_type, c.working_type, c.title_name, c.level_name, 
          c.department_code, c.room_code, c.base_salary, c.insurance_salary, c.shift_type,
          c.fixed_shift_code, c.has_tax_deduction, c.dependent_count, c.end_date as contract_end_date
        FROM hr_employees e
        LEFT JOIN hr_contracts c ON e.id = c.employee_id AND c.status = 'ACTIVE'
        WHERE (c.contract_type = ? OR ? = '')
      `;
      const params = [contractType, incomingTab];

      if (search) {
        sql += ` AND (e.full_name LIKE ? OR e.employee_code LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (position && position !== 'Tất cả') {
        sql += ` AND c.title_name = ?`;
        params.push(position);
      }
      if (department_code && department_code !== 'Tất cả') {
        sql += ` AND c.department_code = ?`;
        params.push(department_code);
      }

      sql += ` ORDER BY e.status ASC, c.end_date ASC`;
      const [rows] = await db.query(sql, params);

      // Trả về đa cấu trúc trường để bọc lót an toàn cho FE
      res.status(200).json({
        success: true,
        data: rows,
        results: rows,
        employees: rows
      });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi nạp danh sách nhân sự', error: e.message });
    }
  },

  // 2. POST: Thêm mới nhân viên và kích hoạt hợp đồng (Sử dụng Transaction an toàn)
  createEmployee: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { personal, contract } = req.body;

      // Kiểm tra ràng buộc tuổi hành nghề lớn hơn hoặc bằng 18
      const dob = new Date(personal.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      
      if (age < 18) {
        return res.status(400).json({ success: false, message: '⚠️ Nhân sự chưa đủ 18 tuổi để đăng ký kết ước lao động!' });
      }

      // Kiểm tra chống trùng dữ liệu
      const [checkDup] = await connection.query(
        'SELECT id FROM hr_employees WHERE employee_code = ? OR phone = ? OR email = ?',
        [personal.employee_code, personal.phone, personal.email]
      );
      if (checkDup.length > 0) {
        return res.status(400).json({ success: false, message: '⚠️ Trùng lặp: Mã nhân viên, Số điện thoại hoặc Email đã tồn tại!' });
      }

      const rawUsername = personal.email.split('@')[0] || personal.employee_code.toLowerCase();
      const generatedPassword = generateSecurePassword();

      const empSql = `
        INSERT INTO hr_employees (
          employee_code, full_name, gender, dob, cccd_passport, cccd_date, cccd_place, 
          nationality, address, phone, email, emergency_name, emergency_phone, 
          qualification_level, specialty, username, password, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WORKING')
      `;
      const [empResult] = await connection.query(empSql, [
        personal.employee_code, personal.full_name, personal.gender, personal.dob,
        personal.cccd_passport || null, personal.cccd_date || null, personal.cccd_place || null,
        personal.nationality || 'Việt Nam', personal.address || null, personal.phone, personal.email,
        personal.emergency_name || null, personal.emergency_phone || null, personal.qualification_level,
        personal.specialty || null, rawUsername, generatedPassword
      ]);

      const newEmployeeId = empResult.insertId;

      // Tính toán ngày hết hạn dựa trên thời hạn hợp đồng lao động
      const startDate = new Date(contract.start_date);
      const durationValue = parseInt(contract.duration_value) || 1;
      if (contract.duration_unit === 'Năm') {
        startDate.setFullYear(startDate.getFullYear() + durationValue);
      } else {
        startDate.setMonth(startDate.getMonth() + durationValue);
      }
      const endDate = startDate.toISOString().split('T')[0];

      const contractSql = `
        INSERT INTO hr_contracts (
          employee_id, contract_number, contract_type, working_type, title_name, level_name,
          department_code, room_code, duration_value, duration_unit, start_date, end_date, 
          shift_type, fixed_shift_code, salary_type, base_salary, insurance_salary, 
          has_social_insurance, has_tax_deduction, dependent_count, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'ACTIVE')
      `;
      await connection.query(contractSql, [
        newEmployeeId, contract.contract_number, contract.contract_type, contract.working_type,
        contract.title_name, contract.level_name, contract.department_code, contract.room_code || null,
        durationValue, contract.duration_unit, contract.start_date, endDate,
        contract.shift_type, contract.fixed_shift_code || null, contract.salary_type,
        parseFloat(contract.base_salary) || 0, parseFloat(contract.insurance_salary) || 0,
        contract.has_tax_deduction ? 1 : 0, parseInt(contract.dependent_count) || 0
      ]);

      await connection.commit();
      res.status(201).json({ 
        success: true, 
        message: '🎉 Khởi tạo hồ sơ nhân viên và kích hoạt hợp đồng thành công!',
        account: { username: rawUsername, password: generatedPassword }
      });
    } catch (e) {
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Thất bại khi ghi nhận dữ liệu', error: e.message });
    } finally {
      connection.release();
    }
  },

  // 3. PUT: Cập nhật thông tin chi tiết (Đồng bộ nút Cập nhật/Sửa hồ sơ)
  updateEmployee: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;
      const { personal, contract } = req.body;

      const updateEmpSql = `
        UPDATE hr_employees SET 
          full_name = ?, gender = ?, dob = ?, cccd_passport = ?, phone = ?, email = ?,
          address = ?, qualification_level = ?, specialty = ?
        WHERE id = ?
      `;
      await connection.query(updateEmpSql, [
        personal.full_name, personal.gender, personal.dob, personal.cccd_passport, personal.phone, personal.email,
        personal.address, personal.qualification_level, personal.specialty,
        id
      ]);

      const updateContractSql = `
        UPDATE hr_contracts SET 
          contract_number = ?, contract_type = ?, working_type = ?, title_name = ?, level_name = ?,
          department_code = ?, room_code = ?, shift_type = ?, fixed_shift_code = ?, 
          salary_type = ?, base_salary = ?, insurance_salary = ?, has_tax_deduction = ?, dependent_count = ?
        WHERE employee_id = ? AND status = 'ACTIVE'
      `;
      await connection.query(updateContractSql, [
        contract.contract_number, contract.contract_type, contract.working_type, contract.title_name, contract.level_name,
        contract.department_code, contract.room_code || null, contract.shift_type, contract.fixed_shift_code || null,
        contract.salary_type, parseFloat(contract.base_salary) || 0, parseFloat(contract.insurance_salary) || 0,
        contract.has_tax_deduction ? 1 : 0, parseInt(contract.dependent_count) || 0,
        id
      ]);

      await connection.commit();
      res.status(200).json({ success: true, message: '🎉 Đã lưu toàn bộ thay đổi hồ sơ nhân viên thành công!' });
    } catch (e) {
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Lỗi cập nhật dữ liệu', error: e.message });
    } finally {
      connection.release();
    }
  },

  // 4. PATCH: Bật/Tắt nhanh trạng thái (Đoạn gạt nút Switch ngoài lưới danh sách)
  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const isWorking = req.body.isWorking || req.body.status === 'WORKING';
      const nextStatus = isWorking ? 'WORKING' : 'RESIGNED';

      await db.query('UPDATE hr_employees SET status = ? WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: '🎉 Thay đổi trạng thái làm việc của nhân sự thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi chuyển trạng thái', error: e.message });
    }
  },

  // 5. PUT: Reset FaceID ứng dụng di động về trạng thái ban đầu
  resetFaceID: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('UPDATE hr_employees SET face_id_status = 0 WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: '🎉 Đã đặt lại trạng thái nhận diện FaceID về mặc định!' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi reset FaceID', error: e.message });
    }
  }
};

employeeController.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[emp]] = await db.query(`
      SELECT e.*,
             COALESCE(jt.name,'Nhân viên') as job_title_name,
             dep.name as department_name, rm.name as room_name
      FROM hr_employees e
      LEFT JOIN hr_contracts c ON c.employee_id=e.id AND c.status='ACTIVE'
      LEFT JOIN cat_titles jt ON jt.id=c.job_title_code
      LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
      LEFT JOIN cat_departments dep ON dep.code=rsd.department_code
      LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id=e.id
      LEFT JOIN cat_rooms rm ON rm.code=rsr.room_code
      WHERE e.id=? LIMIT 1
    `, [id]);
    if (!emp) return res.status(404).json({ statusCode: 404, message: 'Không tìm thấy nhân viên' });
    res.json({ statusCode: 200, data: emp, message: 'success' });
  } catch(e) {
    res.status(500).json({ statusCode: 500, message: 'Lỗi lấy thông tin nhân viên', error: e.message });
  }
};

module.exports = employeeController;