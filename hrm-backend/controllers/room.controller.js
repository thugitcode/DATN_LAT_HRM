const db = require('../config/db');

const roomController = {
  // 1. GET: Lấy danh sách phòng kèm Ghi chú và Tên khoa trực thuộc
  getAll: async (req, res) => {
    try {
      const sql = `
        SELECT r.*, d.name as department_name 
        FROM cat_rooms r
        LEFT JOIN cat_departments d ON r.department_code = d.code
        ORDER BY r.id DESC
      `;
      const [rows] = await db.query(sql);
      res.status(200).json({ success: true, data: rows });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server đọc danh sách phòng', error: e.message });
    }
  },

  // 2. POST: Thêm mới phòng ban
  create: async (req, res) => {
    try {
      const { code, name, start_time, end_time, department_code, type, medical_form, description } = req.body;

      if (!code?.trim() || !name?.trim() || !department_code || !type) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đủ Mã phòng, Tên phòng, Chọn khoa và Loại phòng!' });
      }

      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

      const sql = `INSERT INTO cat_rooms 
        (code, name, start_time, end_time, department_code, type, medical_form, description, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, "ACTIVE")`;
      
      await db.query(sql, [
        formattedCode, 
        name.trim(), 
        start_time || '00:00:00', 
        end_time || '23:55:00', 
        department_code, 
        type,
        medical_form || null,
        description?.trim() || null
      ]);

      res.status(201).json({ success: true, message: `🎉 Khởi tạo phòng [${name.trim()}] thành công!` });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: '❌ Lỗi: Mã phòng này đã tồn tại!' });
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  // 3. PUT: Cập nhật thông tin phòng ban
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, start_time, end_time, department_code, type, medical_form, description } = req.body;

      if (!name?.trim() || !department_code || !type) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đủ Tên phòng, Khoa quản lý và Loại phòng!' });
      }

      const sql = `UPDATE cat_rooms SET 
        name = ?, start_time = ?, end_time = ?, department_code = ?, type = ?, medical_form = ?, description = ? 
        WHERE id = ?`;
      
      await db.query(sql, [
        name.trim(), 
        start_time, 
        end_time, 
        department_code, 
        type, 
        medical_form || null,
        description?.trim() || null, 
        id
      ]);

      res.status(200).json({ success: true, message: '🎉 Đã cập nhật thay đổi thông tin phòng ban!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  toggle: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE cat_rooms SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đổi trạng thái thành công' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM cat_rooms WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa phòng chức năng!' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  }
};

module.exports = roomController;