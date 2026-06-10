const db = require('../config/db');

const leaveReasonController = {
  // 1. Lấy danh sách lý do nghỉ (GET)
  getAll: async (req, res) => {
    try {
      const sql = `
        SELECT lr.*, lf.name as fund_name 
        FROM leave_reasons lr
        LEFT JOIN leave_funds lf ON lr.leave_fund_id = lf.id 
        ORDER BY lr.created_at DESC`;
      const [rows] = await db.query(sql);
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Helper: Lấy nhanh danh sách quỹ nghỉ để hiển thị lên Dropdown chọn ở Frontend
  getFunds: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT id, name FROM leave_funds WHERE status = "ACTIVE" OR status = "1"');
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, data: [] });
    }
  },

  // 2. Thêm mới lý do nghỉ (POST)
  create: async (req, res) => {
    try {
      const { code, name, short_code, salary_rate, leave_fund_id, require_document, note, status } = req.body;
      const dbStatus = status === false || status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const dbRequireDoc = require_document ? 1 : 0;

      const sql = `INSERT INTO leave_reasons 
        (code, name, short_code, salary_rate, leave_fund_id, require_document, note, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const [result] = await db.query(sql, [code, name, short_code, salary_rate || 0, leave_fund_id, dbRequireDoc, note || null, dbStatus]);
      res.status(201).json({ success: true, message: 'Thêm mới thành công', insertId: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Mã hoặc Mã viết tắt đã tồn tại' });
      }
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // 3. Cập nhật lý do nghỉ (PUT)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, short_code, salary_rate, leave_fund_id, require_document, note, status } = req.body;
      const dbStatus = status === false || status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const dbRequireDoc = require_document ? 1 : 0;

      const sql = `UPDATE leave_reasons SET 
        name=?, short_code=?, salary_rate=?, leave_fund_id=?, require_document=?, note=?, status=? 
        WHERE id=?`;
      
      const [result] = await db.query(sql, [name, short_code, salary_rate || 0, leave_fund_id, dbRequireDoc, note || null, dbStatus, id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
      res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // 4. Xóa lý do nghỉ (DELETE)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await db.query('DELETE FROM leave_reasons WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
      res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Không thể xóa do dữ liệu đang được sử dụng ở bảng khác' });
    }
  }
};

module.exports = leaveReasonController;