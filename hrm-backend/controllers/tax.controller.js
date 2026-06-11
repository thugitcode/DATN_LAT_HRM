const db = require('../config/db');

const taxController = {
  // GET: Lấy toàn bộ cấu hình phục vụ giao diện
  getConfig: async (req, res) => {
    try {
      const [types] = await db.query('SELECT * FROM cat_tax_employee_types ORDER BY is_system DESC, id ASC');
      const [brackets] = await db.query('SELECT * FROM cat_tax_brackets ORDER BY level_number ASC');
      res.status(200).json({ success: true, employeeTypes: types, brackets });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Thất bại khi nạp cấu hình thuế', error: e.message });
    }
  },

  // PUT: Đồng bộ toàn bộ dữ liệu thay đổi khi bấm Lưu
  updateConfig: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { employeeTypes, brackets } = req.body;

      // 1. Đồng bộ nhóm đối tượng nhân sự (Xóa dòng cũ không thuộc hệ thống, nạp lại dòng mới)
      await connection.query('DELETE FROM cat_tax_employee_types WHERE is_system = 0');
      for (let t of employeeTypes) {
        if (t.is_system === 1) {
          await connection.query('UPDATE cat_tax_employee_types SET tax_method = ? WHERE id = ?', [t.tax_method, t.id]);
        } else if (t.name?.trim()) {
          await connection.query('INSERT INTO cat_tax_employee_types (name, tax_method, is_system) VALUES (?, ?, 0)', [t.name.trim(), t.tax_method]);
        }
      }

      // 2. Đồng bộ biểu mẫu lũy tiến từng phần
      await connection.query('DELETE FROM cat_tax_brackets');
      let currentFrom = 0;
      for (let i = 0; i < brackets.length; i++) {
        const b = brackets[i];
        const toAmt = parseFloat(b.to_amount) || 0;
        const rate = parseFloat(b.tax_rate) || 0;
        
        await connection.query(
          'INSERT INTO cat_tax_brackets (level_number, from_amount, to_amount, tax_rate) VALUES (?, ?, ?, ?)',
          [i + 1, currentFrom, toAmt, rate]
        );
        currentFrom = toAmt; // Tự động lấy điểm kết thúc của bậc này làm điểm khởi đầu bậc sau
      }

      await connection.commit();
      res.status(200).json({ success: true, message: '🎉 Đã đồng bộ cấu hình và biểu mẫu lũy tiến TNCN mới!' });
    } catch (e) {
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Gặp sự cố khi ghi nhận dữ liệu', error: e.message });
    } finally {
      connection.release();
    }
  }
};

module.exports = taxController;