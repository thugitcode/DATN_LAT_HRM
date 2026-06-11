const db = require('../config/db');

const holidayController = {
  // 1. Lấy danh sách ngày lễ kèm danh sách ID nhân viên áp dụng (nếu có)
  getAll: async (req, res) => {
    try {
      // SỬ SỬA: Dùng DATE_FORMAT để ép cứng ngày về chuỗi YYYY-MM-DD từ database
      const sql = `
        SELECT 
          id, name, 
          DATE_FORMAT(start_date, '%Y-%m-%d') as start_date, 
          DATE_FORMAT(end_date, '%Y-%m-%d') as end_date, 
          salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, note 
        FROM holidays 
        ORDER BY start_date ASC`;
        
      const [holidays] = await db.query(sql);
      
      // Đổ thêm mảng employee_ids cho từng ngày lễ phục vụ nút Sửa thông tin
      for (let h of holidays) {
        if (h.apply_type === 'SPECIFIC') {
          const [emps] = await db.query('SELECT employee_id FROM holiday_employees WHERE holiday_id = ?', [h.id]);
          h.employee_ids = emps.map(e => e.employee_id);
        } else {
          h.employee_ids = [];
        }
      }
      
      res.status(200).json({ success: true, data: holidays });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ không thể đọc dữ liệu', error: error.message });
    }
  },

  // Helper: Lấy nhanh danh sách nhân viên để hiển thị lên ô Select ở FE
  getEmployees: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT id, name FROM employees WHERE status = "ACTIVE" OR status = "1"');
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      res.status(200).json({ success: true, data: [] });
    }
  },

  // 2. Thêm mới ngày lễ (POST) - Phòng thủ toàn diện
  create: async (req, res) => {
    const connection = await db.getConnection(); // Dùng Transaction để bảo vệ tính toàn vẹn dữ liệu
    await connection.beginTransaction();

    try {
      const { name, start_date, end_date, salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, employee_ids, note } = req.body;

      // --- TẦNG 1: CHỦ ĐỘNG VALIDATE THIẾU THÔNG TIN ---
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: '⚠️ Tên ngày nghỉ lễ không được bỏ trống!' });
      }
      if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng nhập khoảng thời gian bắt đầu và kết thúc!' });
      }

      // --- TẦNG 2: KIỂM TRA LOGIC NGHIỆP VỤ ---
      if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({ success: false, message: '❌ Ngày kết thúc không được nhỏ hơn ngày bắt đầu!' });
      }
      if (apply_type === 'SPECIFIC' && (!employee_ids || employee_ids.length === 0)) {
        return res.status(400).json({ success: false, message: '⚠️ Bạn chọn áp dụng riêng biệt nhưng chưa chọn nhân viên nào!' });
      }

      // Chuyển đổi dữ liệu an toàn trước khi insert
      const coefLeave = salary_coef_leave ? parseFloat(salary_coef_leave) : 1.0;
      const coefWork = salary_coef_work ? parseFloat(salary_coef_work) : 1.0;
      const dbFixed = is_annual_fixed ? 1 : 0;
      const dbApplyType = apply_type === 'SPECIFIC' ? 'SPECIFIC' : 'ALL';

      // Chèn bảng chính
      const sqlHoliday = `INSERT INTO holidays 
        (name, start_date, end_date, salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, note) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await connection.query(sqlHoliday, [name.trim(), start_date, end_date, coefLeave, coefWork, dbFixed, dbApplyType, note || null]);
      
      const holidayId = result.insertId;

      // Nếu áp dụng cho nhân viên cụ thể, chèn vào bảng trung gian
      if (dbApplyType === 'SPECIFIC' && employee_ids && employee_ids.length > 0) {
        const empValues = employee_ids.map(empId => [holidayId, empId]);
        await connection.query('INSERT INTO holiday_employees (holiday_id, employee_id) VALUES ?', [empValues]);
      }

      await connection.commit();
      res.status(201).json({ success: true, message: '🎉 Tạo ngày nghỉ lễ thành công!' });

    } catch (error) {
      await connection.rollback(); // Hủy toàn bộ thao tác nếu có bất kỳ lỗi gì xảy ra
      res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu dữ liệu', error: error.message });
    } finally {
      connection.release();
    }
  },

  // 3. Cập nhật ngày lễ (PUT)
  update: async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const { id } = req.params;
      const { name, start_date, end_date, salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, employee_ids, note } = req.body;

      if (!name || !name.trim()) return res.status(400).json({ success: false, message: '⚠️ Tên ngày lễ không được bỏ trống!' });
      if (!start_date || !end_date) return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đủ ngày tháng!' });
      if (new Date(start_date) > new Date(end_date)) return res.status(400).json({ success: false, message: '❌ Ngày kết thúc sai logic!' });

      const coefLeave = parseFloat(salary_coef_leave || 1.0);
      const coefWork = parseFloat(salary_coef_work || 1.0);
      const dbFixed = is_annual_fixed ? 1 : 0;
      const dbApplyType = apply_type === 'SPECIFIC' ? 'SPECIFIC' : 'ALL';

      // Cập nhật bảng chính
      const sqlUpdate = `UPDATE holidays SET 
        name=?, start_date=?, end_date=?, salary_coef_leave=?, salary_coef_work=?, is_annual_fixed=?, apply_type=?, note=? 
        WHERE id=?`;
      await connection.query(sqlUpdate, [name.trim(), start_date, end_date, coefLeave, coefWork, dbFixed, dbApplyType, note || null, id]);

      // Làm sạch dữ liệu nhân viên cũ trong bảng trung gian để nạp lại dữ liệu mới
      await connection.query('DELETE FROM holiday_employees WHERE holiday_id = ?', [id]);

      if (dbApplyType === 'SPECIFIC' && employee_ids && employee_ids.length > 0) {
        const empValues = employee_ids.map(empId => [id, empId]);
        await connection.query('INSERT INTO holiday_employees (holiday_id, employee_id) VALUES ?', [empValues]);
      }

      await connection.commit();
      res.status(200).json({ success: true, message: '🎉 Cập nhật ngày nghỉ lễ thành công!' });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Lỗi máy chủ không thể cập nhật', error: error.message });
    } finally {
      connection.release();
    }
  },

  // 4. Xóa ngày lễ (DELETE)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      // Do dùng ON DELETE CASCADE nên khi xóa holidays, dữ liệu liên quan ở bảng holiday_employees tự động bay màu theo
      const [result] = await db.query('DELETE FROM holidays WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Dữ liệu không tồn tại' });
      res.status(200).json({ success: true, message: '🗑️ Đã xóa ngày nghỉ lễ thành công!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi không thể xóa bản ghi', error: error.message });
    }
  }
};

module.exports = holidayController;