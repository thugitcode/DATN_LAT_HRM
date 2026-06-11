const db = require('../config/db');

const departmentController = {
  // 1. GET: Lấy toàn bộ danh sách khoa
  getAll: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cat_departments ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server khi đọc danh sách khoa', error: e.message });
    }
  },

  // 2. POST: Thêm mới khoa (Phòng thủ chặn chuỗi trống & mã trùng)
  create: async (req, res) => {
    try {
      const { code, name, byt_code, type, description } = req.body;

      if (!code?.trim() || !name?.trim() || !type) {
        return res.status(400).json({ success: false, message: '⚠️ Mã khoa, Tên khoa và Loại khoa không được bỏ trống!' });
      }

      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

      const sql = 'INSERT INTO cat_departments (code, name, byt_code, type, description, status) VALUES (?, ?, ?, ?, ?, "ACTIVE")';
      await db.query(sql, [formattedCode, name.trim(), byt_code?.trim() || null, type, description?.trim() || null]);

      res.status(201).json({ success: true, message: `🎉 Tạo thành công khoa [${name.trim()}]!` });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: '❌ Lỗi: Mã khoa này đã tồn tại trên hệ thống!' });
      }
      res.status(500).json({ success: false, message: 'Lỗi ghi cơ sở dữ liệu', error: e.message });
    }
  },

  // 3. PUT: Chỉnh sửa thông tin khoa
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, byt_code, type, description } = req.body;

      if (!name?.trim() || !type) {
        return res.status(400).json({ success: false, message: '⚠️ Tên khoa và Loại khoa không được bỏ trống!' });
      }

      const sql = 'UPDATE cat_departments SET name = ?, byt_code = ?, type = ?, description = ? WHERE id = ?';
      await db.query(sql, [name.trim(), byt_code?.trim() || null, type, description?.trim() || null, id]);

      res.status(200).json({ success: true, message: '🎉 Cập nhật thông tin khoa thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật dữ liệu', error: e.message });
    }
  },

  // 4. PUT: Đổi trạng thái Switch nhanh ngoài lưới danh sách
  toggle: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'ACTIVE' hoặc 'INACTIVE'
      await db.query('UPDATE cat_departments SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đã đổi trạng thái hoạt động của khoa thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // 5. DELETE: Xóa khoa (Có bọc lót chặn xóa nếu có phòng đang trực thuộc)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM cat_departments WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa khoa thành công khỏi danh mục!' });
    } catch (e) {
      if (e.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ 
          success: false, 
          message: '❌ Không thể xóa! Khoa này đang có các Phòng chức năng trực thuộc. Hãy xóa hoặc điều chuyển các phòng trước!' 
        });
      }
      res.status(500).json({ success: false, message: 'Lỗi khi xóa', error: e.message });
    }
  }
};

module.exports = departmentController;