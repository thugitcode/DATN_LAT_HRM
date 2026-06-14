const db = require('../config/db');

const taxController = {
  // 1. GET: Lấy toàn bộ cấu hình phục vụ giao diện (Bao gồm Đối tượng, Lũy tiến & Gia cảnh)
  getConfig: async (req, res) => {
    try {
      const [types] = await db.query('SELECT * FROM cat_tax_employee_types ORDER BY is_system DESC, id ASC');
      const [brackets] = await db.query('SELECT * FROM cat_tax_brackets ORDER BY level_number ASC');
      
      // ➕ BỔ SUNG: Nạp định mức giảm trừ gia cảnh từ bảng config toàn cục
      const [globals] = await db.query('SELECT * FROM cat_tax_global_config');
      
      // Chuyển đổi mảng [{config_key: 'SELF_DEDUCTION', config_value: 11000000}] thành Object dạng { SELF_DEDUCTION: 11000000 }
      const globalsObj = globals.reduce((acc, cur) => {
        acc[cur.config_key] = cur.config_value;
        return acc;
      }, {});

      res.status(200).json({ 
        success: true, 
        employeeTypes: types, 
        brackets,
        globals: globalsObj // Trả về để FE bốc dữ liệu nạp vào ô nhập
      });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Thất bại khi nạp cấu hình thuế', error: e.message });
    }
  },

  // 2. PUT: Đồng bộ toàn bộ dữ liệu thay đổi khi bấm Lưu
  updateConfig: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // ⚙️ Nhận thêm dữ liệu giảm trừ từ body gửi lên
      const { employeeTypes, brackets, self_deduction, dependent_deduction } = req.body;

      // ➕ PHÒNG THỦ LỚP 1: Ghi nhận định mức giảm trừ gia cảnh mới vào DB
      if (self_deduction !== undefined && dependent_deduction !== undefined) {
        await connection.query('UPDATE cat_tax_global_config SET config_value = ? WHERE config_key = "SELF_DEDUCTION"', [parseFloat(self_deduction) || 0]);
        await connection.query('UPDATE cat_tax_global_config SET config_value = ? WHERE config_key = "DEPENDENT_DEDUCTION"', [parseFloat(dependent_deduction) || 0]);
      }

      // ⚙️ PHÒNG THỦ LỚP 2: Đồng bộ nhóm đối tượng nhân sự (Có kèm theo xử lý fixed_rate)
      await connection.query('DELETE FROM cat_tax_employee_types WHERE is_system = 0');
      for (let t of employeeTypes) {
        const fixedRate = parseFloat(t.fixed_rate) || 0; // Đọc tỷ lệ % cố định (Vd: 10%, 20%)
        
        if (t.is_system === 1) {
          // Nếu là cấu hình lõi hệ thống -> Chỉ cập nhật Phương pháp áp thuế và Tỷ lệ cố định
          await connection.query(
            'UPDATE cat_tax_employee_types SET tax_method = ?, fixed_rate = ? WHERE id = ?', 
            [t.tax_method, fixedRate, t.id]
          );
        } else if (t.name?.trim()) {
          // Nếu là dòng do HR tự tạo thêm -> Thêm mới kèm rate cố định
          await connection.query(
            'INSERT INTO cat_tax_employee_types (name, tax_method, fixed_rate, is_system) VALUES (?, ?, ?, 0)', 
            [t.name.trim(), t.tax_method, fixedRate]
          );
        }
      }

      // ⚙️ PHÒNG THỦ LỚP 3: Đồng bộ biểu mẫu lũy tiến từng phần
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
      res.status(200).json({ success: true, message: '🎉 Đã đồng bộ cấu hình định mức và biểu mẫu lũy tiến TNCN hợp pháp!' });
    } catch (e) {
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Gặp sự cố khi ghi nhận dữ liệu', error: e.message });
    } finally {
      connection.release();
    }
  },
  // GET /api/tax/rate — trả về tax employee types
  getRate: async (req, res) => {
    try {
      const [types] = await db.query('SELECT * FROM cat_tax_employee_types ORDER BY is_system DESC, id ASC');
      res.status(200).json({ statusCode: 200, success: true, data: types });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // GET /api/tax/bracket — trả về tax brackets
  getBrackets: async (req, res) => {
    try {
      const [brackets] = await db.query('SELECT * FROM cat_tax_brackets ORDER BY level_number ASC');
      res.status(200).json({ statusCode: 200, success: true, data: brackets });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },
};

module.exports = taxController;