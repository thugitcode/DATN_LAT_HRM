const db = require('../config/db');

const leaveFundController = {
  // 1. Lấy danh sách quỹ nghỉ (GET)
  getAll: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM leave_funds ORDER BY created_at DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // 2. Thêm mới quỹ nghỉ (POST)
  create: async (req, res) => {
    try {
      const { 
        code, name, allowance_value, allowance_unit, 
        max_limit_value, max_limit_unit, is_carried_forward, 
        expiration_date, carry_forward_rate, note, status 
      } = req.body;

      const dbStatus = status === false || status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const dbCarried = is_carried_forward ? 1 : 0;

      const sql = `INSERT INTO leave_funds 
        (code, name, allowance_value, allowance_unit, max_limit_value, max_limit_unit, is_carried_forward, expiration_date, carry_forward_rate, note, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        code, name, allowance_value, allowance_unit, 
        max_limit_value || null, max_limit_unit || null, 
        dbCarried, expiration_date || null, carry_forward_rate || null, 
        note || null, dbStatus
      ];

      const [result] = await db.query(sql, values);
      res.status(201).json({ success: true, message: 'Thêm quỹ nghỉ thành công', insertId: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Mã quỹ nghỉ này đã tồn tại' });
      }
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // 3. Cập nhật quỹ nghỉ (PUT)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        name, allowance_value, allowance_unit, 
        max_limit_value, max_limit_unit, is_carried_forward, 
        expiration_date, carry_forward_rate, note, status 
      } = req.body;

      const dbStatus = status === false || status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const dbCarried = is_carried_forward ? 1 : 0;

      const sql = `UPDATE leave_funds SET 
        name=?, allowance_value=?, allowance_unit=?, max_limit_value=?, max_limit_unit=?, 
        is_carried_forward=?, expiration_date=?, carry_forward_rate=?, note=?, status=? 
        WHERE id=?`;
      
      const values = [
        name, allowance_value, allowance_unit, 
        max_limit_value || null, max_limit_unit || null, 
        dbCarried, expiration_date || null, carry_forward_rate || null, 
        note || null, dbStatus, id
      ];

      const [result] = await db.query(sql, values);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy quỹ nghỉ' });
      res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // 4. Xóa quỹ nghỉ (DELETE)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await db.query('DELETE FROM leave_funds WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
      res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Không thể xóa do quỹ nghỉ đang liên kết với dữ liệu lý do nghỉ!' });
    }
  }
};

module.exports = leaveFundController;