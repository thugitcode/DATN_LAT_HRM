const db = require('../config/db');

const roomController = {

  getAll: async (req, res) => {
    try {
      const getAll      = req.query.getAll === 'true' || req.query.getAll === '1';
      // FE gửi departmentId (string đơn) hoặc departmentIds (array)
      const departmentId  = req.query.departmentId || '';
      const departmentIds = [].concat(req.query.departmentIds || req.query['departmentIds[]'] || []);

      const conditions = [];
      const params = [];

      // Filter theo departmentId đơn hoặc departmentIds array
      // cat_rooms lưu department_code (varchar) nhưng FE có thể gửi id (số) hoặc code (chữ)
      if (departmentId) {
        // Nếu là số → tìm theo id của department → lấy code → filter
        if (/^\d+$/.test(departmentId)) {
          conditions.push('r.department_code = (SELECT code FROM cat_departments WHERE id = ? LIMIT 1)');
        } else {
          conditions.push('r.department_code = ?');
        }
        params.push(departmentId);
      } else if (departmentIds.length > 0) {
        const placeholders = departmentIds.map(id =>
          /^\d+$/.test(id)
            ? '(SELECT code FROM cat_departments WHERE id = ? LIMIT 1)'
            : '?'
        ).join(',');
        conditions.push(`r.department_code IN (${placeholders})`);
        params.push(...departmentIds);
      }

      if (getAll) {
        conditions.push("r.status = 'ACTIVE'");
      }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      const sql = `
        SELECT r.id, r.code, r.name, r.type, r.status,
               r.start_time, r.end_time, r.description, r.medical_form,
               r.department_code,
               d.name AS department_name,
               d.id   AS department_id
        FROM cat_rooms r
        LEFT JOIN cat_departments d ON d.code = r.department_code
        ${where}
        ORDER BY r.name ASC
      `;

      const [rows] = await db.query(sql, params);

      const data = rows.map(r => ({
        id:           String(r.id),
        code:         r.code,
        name:         r.name,
        type:         r.type,
        status:       r.status,
        start_time:   r.start_time   ? String(r.start_time).substring(0,5)   : null,
        end_time:     r.end_time     ? String(r.end_time).substring(0,5)     : null,
        description:  r.description  || null,
        medical_form: r.medical_form || null,
        department_code: r.department_code,
        department_name: r.department_name,
        department: r.department_id
          ? { id: String(r.department_id), name: r.department_name || '', code: r.department_code }
          : null,
        departmentId: r.department_code || null,
      }));

      res.status(200).json({ statusCode: 200, success: true, data });
    } catch (e) {
      console.error('[GET /room]', e);
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  getById: async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT r.*, d.name AS department_name, d.id AS department_id
         FROM cat_rooms r
         LEFT JOIN cat_departments d ON d.code = r.department_code
         WHERE r.id = ?`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
      const r = rows[0];
      res.status(200).json({ statusCode: 200, success: true, data: {
        id: String(r.id), code: r.code, name: r.name, type: r.type, status: r.status,
        department_code: r.department_code, department_name: r.department_name,
      }});
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  create: async (req, res) => {
    try {
      const { code, name, start_time, end_time, department_code, type, medical_form, description } = req.body;
      if (!code?.trim() || !name?.trim() || !department_code || !type)
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Mã phòng, Tên phòng, Khoa và Loại phòng!' });

      await db.query(
        `INSERT INTO cat_rooms (code, name, start_time, end_time, department_code, type, medical_form, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [code.trim().toUpperCase().replace(/\s+/g, '_'), name.trim(),
         start_time || '00:00:00', end_time || '23:55:00',
         department_code, type, medical_form || null, description?.trim() || null]
      );
      res.status(201).json({ success: true, message: `Khởi tạo phòng [${name.trim()}] thành công!` });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Mã phòng đã tồn tại!' });
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const { name, start_time, end_time, department_code, type, medical_form, description, status } = req.body;
      if (!name?.trim() || !department_code || !type)
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Tên phòng, Khoa và Loại phòng!' });

      await db.query(
        `UPDATE cat_rooms SET name=?, start_time=?, end_time=?, department_code=?, type=?, medical_form=?, description=?, status=? WHERE id=?`,
        [name.trim(), start_time, end_time, department_code, type,
         medical_form || null, description?.trim() || null, status || 'ACTIVE', req.params.id]
      );
      res.status(200).json({ success: true, message: 'Cập nhật thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  toggle: async (req, res) => {
    try {
      await db.query('UPDATE cat_rooms SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
      res.status(200).json({ success: true, message: 'Đổi trạng thái thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM cat_rooms WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: 'Đã xóa phòng thành công!' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
    }
  },
};

module.exports = roomController;