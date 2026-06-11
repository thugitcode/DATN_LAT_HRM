const db = require('../config/db');

const allowanceController = {
  // GET: Lấy danh sách chính sách
  getAll: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cat_allowances ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi nạp danh sách phụ cấp', error: e.message });
    }
  },

  // GET: Lấy chi tiết 1 chính sách phục vụ form sửa
  getDetail: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cat_allowances WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
      res.status(200).json({ success: true, data: rows[0] });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // POST: Tạo mới chính sách
  create: async (req, res) => {
    try {
      const { 
        code, name, payment_type, start_date, nature, 
        is_taxable, is_tax_exempt_full, is_tax_exempt_partial, is_tax_deductible,
        applied_departments, applied_rooms, applied_positions, applied_employees, policy_value 
      } = req.body;

      if (!code?.trim() || !name?.trim() || !payment_type || !start_date || !nature) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đầy đủ thông tin bắt buộc (*)' });
      }

      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

      const sql = `INSERT INTO cat_allowances 
        (code, name, payment_type, start_date, nature, is_taxable, is_tax_exempt_full, is_tax_exempt_partial, is_tax_deductible, applied_departments, applied_rooms, applied_positions, applied_employees, policy_value, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`;

      await db.query(sql, [
        formattedCode, name.trim(), payment_type, start_date, nature,
        is_taxable ? 1 : 0, is_tax_exempt_full ? 1 : 0, is_tax_exempt_partial ? 1 : 0, is_tax_deductible ? 1 : 0,
        JSON.stringify(applied_departments || []),
        JSON.stringify(applied_rooms || []),
        JSON.stringify(applied_positions || []),
        JSON.stringify(applied_employees || []),
        policy_value?.trim() || null
      ]);

      res.status(201).json({ success: true, message: `🎉 Khởi tạo thành công khoản [${formattedCode}]!` });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: '❌ Mã khoản này đã tồn tại!' });
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // PUT: Cập nhật thông tin chính sách
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        code, name, payment_type, start_date, nature, 
        is_taxable, is_tax_exempt_full, is_tax_exempt_partial, is_tax_deductible,
        applied_departments, applied_rooms, applied_positions, applied_employees, policy_value 
      } = req.body;

      const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

      const sql = `UPDATE cat_allowances SET 
        code=?, name=?, payment_type=?, start_date=?, nature=?, 
        is_taxable=?, is_tax_exempt_full=?, is_tax_exempt_partial=?, is_tax_deductible=?, 
        applied_departments=?, applied_rooms=?, applied_positions=?, applied_employees=?, policy_value=? 
        WHERE id=?`;

      await db.query(sql, [
        formattedCode, name.trim(), payment_type, start_date, nature,
        is_taxable ? 1 : 0, is_tax_exempt_full ? 1 : 0, is_tax_exempt_partial ? 1 : 0, is_tax_deductible ? 1 : 0,
        JSON.stringify(applied_departments || []),
        JSON.stringify(applied_rooms || []),
        JSON.stringify(applied_positions || []),
        JSON.stringify(applied_employees || []),
        policy_value?.trim() || null,
        id
      ]);

      res.status(200).json({ success: true, message: '🎉 Đã cập nhật chính sách phụ cấp/khấu trừ!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // PUT: Gạt công tắc chuyển đổi trạng thái nhanh ngoài lưới
  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE cat_allowances SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: '🎉 Đã cập nhật trạng thái hoạt động!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // DELETE: Xóa chính sách
  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM cat_allowances WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa khoản chính sách này!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
};

module.exports = allowanceController;