const db = require('../config/db');

const jobTitleController = {

  // GET /job-title?getAll=true
  getAll: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, name FROM cat_titles ORDER BY name ASC'
      );
      // Map id thành string vì FE expect string
      const data = rows.map(r => ({ id: String(r.id), name: r.name }));
      res.status(200).json({ statusCode: 200, success: true, data });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi server', error: e.message });
    }
  },

  // GET /job-title/:id
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, name FROM cat_titles WHERE id = ?', [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy chức danh' });
      res.status(200).json({ statusCode: 200, success: true, data: { id: String(rows[0].id), name: rows[0].name } });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi server', error: e.message });
    }
  },

  // POST /job-title
  create: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name?.trim()) return res.status(400).json({ message: 'Tên chức danh không được bỏ trống' });
      const [result] = await db.query('INSERT INTO cat_titles (name) VALUES (?)', [name.trim()]);
      res.status(201).json({ statusCode: 201, success: true, data: { id: String(result.insertId) }, message: 'Tạo thành công' });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Chức danh đã tồn tại' });
      res.status(500).json({ statusCode: 500, message: 'Lỗi server', error: e.message });
    }
  },

  // PUT/PATCH /job-title/:id
  update: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name?.trim()) return res.status(400).json({ message: 'Tên chức danh không được bỏ trống' });
      await db.query('UPDATE cat_titles SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
      res.status(200).json({ statusCode: 200, success: true, message: 'Cập nhật thành công' });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi server', error: e.message });
    }
  },

  // DELETE /job-title/:id
  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM cat_titles WHERE id = ?', [req.params.id]);
      res.status(200).json({ statusCode: 200, success: true, message: 'Đã xóa' });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi server', error: e.message });
    }
  },
};

module.exports = jobTitleController;