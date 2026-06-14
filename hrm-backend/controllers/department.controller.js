const db = require('../config/db');

const departmentController = {

  // GET: Lấy danh sách khoa
  getAll: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cat_departments ORDER BY id DESC');
      const data = rows.map(r => ({ ...r, id: String(r.id) }));
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  // GET: Chi tiết khoa
  getById: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cat_departments WHERE id = ?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy khoa' });
      res.status(200).json({ success: true, statusCode: 200, data: rows[0] });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  // POST: Thêm mới khoa
  create: async (req, res) => {
    try {
      const { code, name, byt_code, type, description } = req.body;
      if (!code?.trim() || !name?.trim() || !type) {
        return res.status(400).json({ success: false, message: 'Mã khoa, Tên khoa và Loại khoa không được bỏ trống!' });
      }
      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');
      await db.query(
        'INSERT INTO cat_departments (code, name, byt_code, type, description, status) VALUES (?, ?, ?, ?, ?, "ACTIVE")',
        [formattedCode, name.trim(), byt_code?.trim() || null, type, description?.trim() || null]
      );
      res.status(201).json({ success: true, message: `Tạo thành công khoa [${name.trim()}]!` });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Mã khoa đã tồn tại!' });
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  // PUT: Cập nhật khoa
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, byt_code, type, description, status } = req.body;
      if (!name?.trim() || !type) {
        return res.status(400).json({ success: false, message: 'Tên khoa và Loại khoa không được bỏ trống!' });
      }
      await db.query(
        'UPDATE cat_departments SET name = ?, byt_code = ?, type = ?, description = ?, status = ? WHERE id = ?',
        [name.trim(), byt_code?.trim() || null, type, description?.trim() || null, status || 'ACTIVE', id]
      );
      res.status(200).json({ success: true, message: 'Cập nhật thông tin khoa thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  // PUT /toggle/:id — Đổi trạng thái switch
  toggle: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE cat_departments SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đã đổi trạng thái khoa thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // DELETE: Xóa khoa
  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM cat_departments WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: 'Đã xóa khoa thành công!' });
    } catch (e) {
      if (e.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ success: false, message: 'Không thể xóa! Khoa đang có phòng trực thuộc!' });
      }
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  }
};

module.exports = departmentController;