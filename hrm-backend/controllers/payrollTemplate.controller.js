const db = require('../config/db');

const payrollTemplateController = {
  // 1. Lấy danh sách mẫu bảng lương + Tự động bốc data Khoa/Phòng để hiển thị Chip ngoài lưới
  getTemplates: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM payroll_templates ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  // 2. Lấy chi tiết 1 mẫu lương bao gồm cả danh sách cột con để nạp lên form sửa
  getTemplateDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const [master] = await db.query('SELECT * FROM payroll_templates WHERE id = ?', [id]);
      if (master.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy mẫu lương' });
      
      const [details] = await db.query('SELECT * FROM payroll_template_details WHERE template_id = ? ORDER BY column_key ASC', [id]);
      res.status(200).json({ success: true, master: master[0], columns: details });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  // 3. Tạo mới Mẫu bảng lương kèm cấu trúc cột chi tiết (Bọc TRANSACTION để chống mất dữ liệu)
  createTemplate: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { name, applied_departments, applied_rooms, applied_employees, applied_positions, columns } = req.body;

      if (!name?.trim()) return res.status(400).json({ success: false, message: '⚠️ Tên mẫu bảng lương là bắt buộc!' });

      const sqlMaster = `INSERT INTO payroll_templates 
        (name, applied_departments, applied_rooms, applied_employees, applied_positions, status) 
        VALUES (?, ?, ?, ?, ?, 'ACTIVE')`;
      

        const [result] = await connection.query(sqlMaster, [
        name.trim(),
        JSON.stringify(applied_departments || []),
        JSON.stringify(applied_rooms || []),
        JSON.stringify(applied_employees || []),
        JSON.stringify(applied_positions || [])
        ]);

      const templateId = result.insertId;

      // Ghi mảng cột con chi tiết vào bảng phụ
      if (columns && columns.length > 0) {
        const sqlDetail = `INSERT INTO payroll_template_details 
          (template_id, column_key, component_code, display_name, custom_formula, is_visible) VALUES ?`;
        
        const values = columns.map((col, index) => [
          templateId,
          String.fromCharCode(65 + index), // Tự sinh mã cột A, B, C, D... từ chỉ số mảng
          col.component_code,
          col.display_name || col.name,
          col.custom_formula || null,
          col.is_visible ? 1 : 0
        ]);
        await connection.query(sqlDetail, [values]);
      }

      await connection.commit();
      res.status(201).json({ success: true, message: '🎉 Khởi tạo mẫu bảng lương và bộ khung cột thành công!' });
    } catch (e) {
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Lỗi hệ thống', error: e.message });
    } finally { connection.release(); }
  },

  // 4. Cập nhật / Sửa đổi mẫu lương
  updateTemplate: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;
      const { name, applied_departments, applied_rooms, applied_employees, applied_positions, columns } = req.body;

      await connection.query(
        `UPDATE payroll_templates SET name=?, applied_departments=?, applied_rooms=?, applied_employees=?, applied_positions=? WHERE id=?`,
        [name.trim(), JSON.stringify(applied_departments), JSON.stringify(applied_rooms), JSON.stringify(applied_employees), JSON.stringify(applied_positions), id]
      );

      // Làm sạch danh sách cột cũ để nạp lại tập cột mới tinh vừa chỉnh sửa
      await connection.query('DELETE FROM payroll_template_details WHERE template_id = ?', [id]);

      if (columns && columns.length > 0) {
        const sqlDetail = `INSERT INTO payroll_template_details (template_id, column_key, component_code, display_name, custom_formula, is_visible) VALUES ?`;
        const values = columns.map((col, idx) => [id, String.fromCharCode(65 + idx), col.component_code || col.code, col.display_name || col.name, col.custom_formula || null, col.is_visible ? 1 : 0]);
        await connection.query(sqlDetail, [values]);
      }

      await connection.commit();
      res.status(200).json({ success: true, message: '🎉 Đã cập nhật trọn vẹn mẫu thiết kế bảng lương!' });
    } catch (e) {
      await connection.rollback();
      res.status(500).json({ success: false, error: e.message });
    } finally { connection.release(); }
  },

  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE payroll_templates SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đổi trạng thái mẫu lương thành công' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  deleteTemplate: async (req, res) => {
    try {
      await db.query('DELETE FROM payroll_templates WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa mẫu bảng lương!' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  }
};

module.exports = payrollTemplateController;