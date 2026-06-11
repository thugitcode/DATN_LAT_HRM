const db = require('../config/db');

// Hàm kiểm tra mã biến có hợp lệ hay không (Chỉ chấp nhận chữ cái, số và dấu gạch dưới)
const isValidVariableCode = (code) => {
  const codeRegex = /^[A-Za-z0-9_]+$/;
  return codeRegex.test(code);
};

const salaryController = {
  // 1. GET: Lấy danh sách thành phần lương
  getComponents: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM salary_components ORDER BY id ASC');
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server không đọc được dữ liệu', error: error.message });
    }
  },

  // 2. POST: Thêm mới thành phần lương
  createComponent: async (req, res) => {
    try {
      const { code, name, component_type, nature, applied_position, limit_amount, allow_over_limit, formula, description } = req.body;

      // --- TẦNG PHÒNG THỦ VÀ VALIDATION DỮ LIỆU ĐẦU VÀO ---
      if (!code?.trim() || !name?.trim() || !component_type || !nature) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đầy đủ các trường bắt buộc có dấu (*)!' });
      }

      // Ép chuẩn mã viết hoa, biến khoảng trắng thành gạch dưới
      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

      if (!isValidVariableCode(formattedCode)) {
        return res.status(400).json({ success: false, message: '❌ Mã thành phần chỉ được chứa chữ cái, số và dấu gạch dưới, không dùng ký tự đặc biệt hay toán tử (+, -, *, /)!' });
      }

      const sql = `INSERT INTO salary_components 
        (code, name, component_type, nature, applied_position, limit_amount, allow_over_limit, formula, description, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`;
      
      await db.query(sql, [
        formattedCode, name.trim(), component_type, nature,
        applied_position || 'Nhân viên',
        parseFloat(limit_amount) || 0.00,
        allow_over_limit ? 1 : 0,
        formula?.trim() || null,
        description?.trim() || null
      ]);

      res.status(201).json({ success: true, message: `🎉 Đã khởi tạo thành công biến số lương [${formattedCode}]!` });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: '❌ Lỗi: Mã thành phần lương này đã tồn tại!' });
      res.status(500).json({ success: false, message: 'Lỗi hệ thống', error: error.message });
    }
  },

  // 3. PUT: Cập nhật / Sửa thành phần lương (TÍNH NĂNG GIA CỐ MỚI)
  updateComponent: async (req, res) => {
    try {
      const { id } = req.params;
      const { code, name, component_type, nature, applied_position, limit_amount, allow_over_limit, formula, description } = req.body;

      if (!code?.trim() || !name?.trim() || !component_type || !nature) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đầy đủ các trường bắt buộc có dấu (*)!' });
      }

      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');
      if (!isValidVariableCode(formattedCode)) {
        return res.status(400).json({ success: false, message: '❌ Mã thành phần không hợp lệ!' });
      }

      const sql = `UPDATE salary_components SET 
        code = ?, name = ?, component_type = ?, nature = ?, applied_position = ?, 
        limit_amount = ?, allow_over_limit = ?, formula = ?, description = ? 
        WHERE id = ?`;

      await db.query(sql, [
        formattedCode, name.trim(), component_type, nature, applied_position,
        parseFloat(limit_amount) || 0.00, allow_over_limit ? 1 : 0,
        formula?.trim() || null, description?.trim() || null, id
      ]);

      res.status(200).json({ success: true, message: `🎉 Đã cập nhật thông tin thành phần [${formattedCode}] thành công!` });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: '❌ Lỗi: Mã thành phần chỉnh sửa bị trùng với một biến khác!' });
      res.status(500).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
    }
  },

  // 4. PUT: Đổi trạng thái Switch nhanh ngoài lưới
  toggleComponentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE salary_components SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đổi trạng thái thành công' });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  },

  // 5. DELETE: Xóa thành phần lương
  deleteComponent: async (req, res) => {
    try {
      await db.query('DELETE FROM salary_components WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa thành phần lương!' });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  }
};

module.exports = salaryController;