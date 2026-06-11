const db = require('../config/db');

const salaryScaleController = {
  // 1. GET: Lấy danh sách ngạch bậc
  getScales: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cat_salary_scales ORDER BY position_name ASC, level_number ASC');
      res.status(200).json({ success: true, data: rows });
    } catch (e) { 
      res.status(500).json({ success: false, message: 'Lỗi nạp danh mục thang lương', error: e.message }); 
    }
  },

  // 2. POST: Thêm mới ngạch bậc lương
  createScale: async (req, res) => {
    try {
      const { position_name, level_number, coefficient, floor_salary, ceil_salary } = req.body;
      const sql = `INSERT INTO cat_salary_scales (position_name, level_number, coefficient, floor_salary, ceil_salary) VALUES (?, ?, ?, ?, ?)`;
      
      await db.query(sql, [
        position_name, 
        parseInt(level_number), 
        parseFloat(coefficient), 
        parseFloat(floor_salary) || 0, 
        parseFloat(ceil_salary) || 0
      ]);
      res.status(201).json({ success: true, message: '🎉 Đã khởi tạo thành công mức ngạch bậc lương mới!' });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: '❌ Cấp bậc và số hiệu bậc này đã tồn tại trong hệ thống!' });
      }
      res.status(500).json({ success: false, message: 'Lỗi thêm mới ngạch bậc', error: e.message });
    }
  },

  // 3. PUT: Cập nhật thông tin ngạch bậc
  updateScale: async (req, res) => {
    try {
      const { id } = req.params;
      const { position_name, level_number, coefficient, floor_salary, ceil_salary } = req.body;
      const sql = `UPDATE cat_salary_scales SET position_name=?, level_number=?, coefficient=?, floor_salary=?, ceil_salary=? WHERE id=?`;
      
      await db.query(sql, [
        position_name, 
        parseInt(level_number), 
        parseFloat(coefficient), 
        parseFloat(floor_salary) || 0, 
        parseFloat(ceil_salary) || 0, 
        id
      ]);
      res.status(200).json({ success: true, message: '🎉 Đã cập nhật ngạch bậc lương thành công!' });
    } catch (e) { 
      res.status(500).json({ success: false, message: 'Lỗi cập nhật dữ liệu', error: e.message }); 
    }
  },

  // 4. PUT: Đổi toggle trạng thái hoạt động nhanh ngoài lưới
  toggleScaleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await db.query('UPDATE cat_salary_scales SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: '🎉 Đã cập nhật trạng thái hoạt động!' });
    } catch (e) { 
      res.status(500).json({ success: false, message: 'Lỗi đổi trạng thái', error: e.message }); 
    }
  },

  // 5. DELETE: Xóa vĩnh viễn ngạch bậc
  deleteScale: async (req, res) => {
    try {
      await db.query('DELETE FROM cat_salary_scales WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa ngạch bậc lương khỏi hệ thống!' });
    } catch (e) { 
      res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa', error: e.message }); 
    }
  }
};

module.exports = salaryScaleController;