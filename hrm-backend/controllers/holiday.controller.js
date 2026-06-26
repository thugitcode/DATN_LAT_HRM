const db = require('../config/db');

const holidayController = {
  // 1. Lấy danh sách ngày lễ
  getAll: async (req, res) => {
    try {
      const sql = `
        SELECT 
          id, name, 
          DATE_FORMAT(start_date, '%Y-%m-%d') as start_date, 
          DATE_FORMAT(end_date, '%Y-%m-%d') as end_date, 
          salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, note 
        FROM holidays 
        ORDER BY start_date ASC`;
        
      const [holidays] = await db.query(sql);
      
      for (let h of holidays) {
        h.employee_ids = [];
      }
      
      res.status(200).json({ success: true, data: holidays });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ không thể đọc dữ liệu', error: error.message });
    }
  },

  // Helper: Lấy danh sách nhân viên
  getEmployees: async (req, res) => {
    try {
      const [rows] = await db.query("SELECT id, full_name as name FROM hr_employees WHERE status != 'RESIGNED'");
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      res.status(200).json({ success: true, data: [] });
    }
  },

  // 2. Thêm mới ngày lễ (POST)
  create: async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const { name, start_date, end_date, salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, note } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: '⚠️ Tên ngày nghỉ lễ không được bỏ trống!' });
      }
      if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng nhập khoảng thời gian bắt đầu và kết thúc!' });
      }
      if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({ success: false, message: '❌ Ngày kết thúc không được nhỏ hơn ngày bắt đầu!' });
      }

      const coefLeave = salary_coef_leave ? parseFloat(salary_coef_leave) : 1.0;
      const coefWork = salary_coef_work ? parseFloat(salary_coef_work) : 1.0;
      const dbFixed = is_annual_fixed ? 1 : 0;
      const dbApplyType = apply_type === 'SPECIFIC' ? 'SPECIFIC' : 'ALL';

      const sqlHoliday = `INSERT INTO holidays 
        (name, start_date, end_date, salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, note) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(sqlHoliday, [name.trim(), start_date, end_date, coefLeave, coefWork, dbFixed, dbApplyType, note || null]);

      await connection.commit();
      res.status(201).json({ success: true, message: '🎉 Tạo ngày nghỉ lễ thành công!' });

    } catch (error) {
      await connection.rollback();
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
      const { name, start_date, end_date, salary_coef_leave, salary_coef_work, is_annual_fixed, apply_type, note } = req.body;

      if (!name || !name.trim()) return res.status(400).json({ success: false, message: '⚠️ Tên ngày lễ không được bỏ trống!' });
      if (!start_date || !end_date) return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đủ ngày tháng!' });
      if (new Date(start_date) > new Date(end_date)) return res.status(400).json({ success: false, message: '❌ Ngày kết thúc sai logic!' });

      const coefLeave = parseFloat(salary_coef_leave || 1.0);
      const coefWork = parseFloat(salary_coef_work || 1.0);
      const dbFixed = is_annual_fixed ? 1 : 0;
      const dbApplyType = apply_type === 'SPECIFIC' ? 'SPECIFIC' : 'ALL';

      const sqlUpdate = `UPDATE holidays SET 
        name=?, start_date=?, end_date=?, salary_coef_leave=?, salary_coef_work=?, is_annual_fixed=?, apply_type=?, note=? 
        WHERE id=?`;
      await connection.query(sqlUpdate, [name.trim(), start_date, end_date, coefLeave, coefWork, dbFixed, dbApplyType, note || null, id]);

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
      const [result] = await db.query('DELETE FROM holidays WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Dữ liệu không tồn tại' });
      res.status(200).json({ success: true, message: '🗑️ Đã xóa ngày nghỉ lễ thành công!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi không thể xóa bản ghi', error: error.message });
    }
  }
};

module.exports = holidayController;