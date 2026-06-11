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

      if (!code?.trim() || !name?.trim() || !component_type || !nature) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đầy đủ các trường bắt buộc có dấu (*)!' });
      }

      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

      if (!isValidVariableCode(formattedCode)) {
        return res.status(400).json({ success: false, message: '❌ Mã thành phần chỉ được chứa chữ cái, số và dấu gạch dưới, không dùng ký tự đặc biệt hay toán tử (+, -, *, /)!' });
      }

      const sql = `INSERT INTO salary_components 
        (code, name, component_type, nature, applied_position, limit_amount, allow_over_limit, formula, description, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`;
      
      await db.query(sql, [
        formattedCode, 
        name.trim(), 
        component_type, 
        nature,
        JSON.stringify(applied_position || ['Tất cả']), 
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

  // 3. PUT: Cập nhật / Sửa thành phần lương
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
        formattedCode, 
        name.trim(), 
        component_type, 
        nature,
        JSON.stringify(applied_position || ['Tất cả']), 
        parseFloat(limit_amount) || 0.00, 
        allow_over_limit ? 1 : 0,
        formula?.trim() || null, 
        description?.trim() || null, 
        id
      ]);

      res.status(200).json({ success: true, message: `🎉 Đã cập nhật thông tin thành phần [${formattedCode}] thành công!` });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: '❌ Lỗi: Mã thành phần chỉnh sửa bị trùng với một biến khác!' });
      res.status(500).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
    }
  },

  // 4. PUT: Đổi trạng thái Switch nhanh ngoài lưới (GIA CỐ KHÓA PHÒNG THỦ CHÉO)
  toggleComponentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Nếu HR muốn TẮT trạng thái hoạt động của biến lương
      if (status === 'INACTIVE') {
        const [comp] = await db.query('SELECT code FROM salary_components WHERE id = ?', [id]);
        if (comp.length > 0) {
          const compCode = comp[0].code;

          // Quét bảng chi tiết cấu trúc cột của các Mẫu lương xem có ai đang dùng mã này không
          const [checkUsed] = await db.query(
            `SELECT DISTINCT t.name 
             FROM payroll_template_details d
             JOIN payroll_templates t ON d.template_id = t.id
             WHERE d.component_code = ? AND t.status = 'ACTIVE'`, 
            [compCode]
          );

          // Phát hiện có phôi mẫu đang dùng -> Chặn đứng, báo tên mẫu cụ thể
          if (checkUsed.length > 0) {
            const templateNames = checkUsed.map(item => `[${item.name}]`).join(', ');
            return res.status(400).json({
              success: false,
              message: `❌ Không thể tắt! Biến số này đang nằm trong cấu trúc của các mẫu bảng lương đang hoạt động: ${templateNames}. Vui lòng gỡ cột này khỏi mẫu lương trước.`
            });
          }
        }
      }

      await db.query('UPDATE salary_components SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: '🎉 Đã cập nhật trạng thái hoạt động thành công!' });
    } catch (error) { 
      res.status(500).json({ success: false, message: 'Lỗi đổi trạng thái', error: error.message }); 
    }
  },

  // 5. DELETE: Xóa vĩnh viễn thành phần lương (GIA CỐ KIỂM TRA RÀNG BUỘC)
  deleteComponent: async (req, res) => {
    try {
      const { id } = req.params;

      const [comp] = await db.query('SELECT code FROM salary_components WHERE id = ?', [id]);
      if (comp.length > 0) {
        const compCode = comp[0].code;

        // Chặn xóa tuyệt đối nếu dính dáng đến cấu trúc phôi mẫu (kể cả mẫu active hay inactive để giữ sạch data)
        const [checkUsed] = await db.query(
          `SELECT DISTINCT t.name 
           FROM payroll_template_details d
           JOIN payroll_templates t ON d.template_id = t.id
           WHERE d.component_code = ?`, 
          [compCode]
        );

        if (checkUsed.length > 0) {
          const templateNames = checkUsed.map(item => `[${item.name}]`).join(', ');
          return res.status(400).json({
            success: false,
            message: `❌ Không thể xóa! Thành phần lương này đang nằm trong phôi dữ liệu của các mẫu: ${templateNames}. Vui lòng xóa cột cấu hình trong mẫu trước.`
          });
        }
      }

      await db.query('DELETE FROM salary_components WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa thành phần lương khỏi hệ thống!' });
    } catch (error) { 
      res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thực hiện lệnh xóa', error: error.message }); 
    }
  }
};

module.exports = salaryController;