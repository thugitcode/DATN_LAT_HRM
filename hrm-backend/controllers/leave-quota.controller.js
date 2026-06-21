const db = require('../config/db');

const mapQuota = (row) => ({
  id:                  String(row.id),
  code:                row.code,
  name:                row.name,
  quotaAmount:         row.quota_amount,
  quotaUnit:           row.quota_unit,
  maxQuota:            row.max_quota,
  maxQuotaUnit:        row.max_quota_unit,
  allowCarryOver:      !!row.allow_carry_over,
  carryOverExpireDate: row.carry_over_expire_date || '',
  carryOverPercent:    parseFloat(row.carry_over_percent) || 0,
  description:         row.description || '',
  status:              row.status,
  createdAt:           row.created_at || '',
});

const leaveQuotaController = {

  getAll: async (req, res) => {
    try {
      const { status, getAll, page = 1, limit = 20, search } = req.query;
      const conditions = [];
      const params = [];

      if (status)  { conditions.push('status = ?');              params.push(status); }
      if (search)  { conditions.push('name LIKE ? OR code LIKE ?'); params.push(`%${search}%`, `%${search}%`); }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      if (getAll === 'true' || getAll === '1') {
        const [rows] = await db.query(`SELECT * FROM cat_leave_quotas ${where} ORDER BY id ASC`, params);
        return res.status(200).json({ statusCode: 200, data: rows.map(mapQuota) });
      }

      const offset = (Number(page) - 1) * Number(limit);
      const [rows] = await db.query(
        `SELECT * FROM cat_leave_quotas ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
        [...params, Number(limit), offset]
      );
      const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM cat_leave_quotas ${where}`, params);

      res.status(200).json({
        statusCode: 200,
        data: rows.map(mapQuota),
        pagination: {
          page: Number(page), limit: Number(limit), total: Number(total),
          totalPage: Math.ceil(total / Number(limit)),
          hasPreviousPage: Number(page) > 1,
          hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
        }
      });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi lấy danh sách loại phép', error: e.message });
    }
  },

  getById: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cat_leave_quotas WHERE id = ? LIMIT 1', [req.params.id]);
      if (!rows.length) return res.status(404).json({ statusCode: 404, message: 'Không tìm thấy' });
      res.status(200).json({ statusCode: 200, data: mapQuota(rows[0]) });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi', error: e.message });
    }
  },

  create: async (req, res) => {
    try {
      const b = req.body;
      const [result] = await db.query(
        `INSERT INTO cat_leave_quotas (code, name, quota_amount, quota_unit, max_quota, max_quota_unit, allow_carry_over, carry_over_expire_date, carry_over_percent, description, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [b.code, b.name, b.quotaAmount || 0, b.quotaUnit || 'DAY', b.maxQuota || 0, b.maxQuotaUnit || 'DAY',
         b.allowCarryOver ? 1 : 0, b.carryOverExpireDate || null, b.carryOverPercent || 0,
         b.description || null, b.status || 'ACTIVE']
      );
      res.status(201).json({ statusCode: 201, data: { id: String(result.insertId) }, message: 'Tạo thành công' });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi tạo', error: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const b = req.body;
      await db.query(
        `UPDATE cat_leave_quotas SET name=?, quota_amount=?, quota_unit=?, max_quota=?, max_quota_unit=?,
         allow_carry_over=?, carry_over_expire_date=?, carry_over_percent=?, description=?, status=? WHERE id=?`,
        [b.name, b.quotaAmount || 0, b.quotaUnit || 'DAY', b.maxQuota || 0, b.maxQuotaUnit || 'DAY',
         b.allowCarryOver ? 1 : 0, b.carryOverExpireDate || null, b.carryOverPercent || 0,
         b.description || null, b.status || 'ACTIVE', req.params.id]
      );
      res.status(200).json({ statusCode: 200, message: 'Cập nhật thành công' });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi cập nhật', error: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM cat_leave_quotas WHERE id = ?', [req.params.id]);
      res.status(200).json({ statusCode: 200, message: 'Xóa thành công' });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi xóa', error: e.message });
    }
  },
};

module.exports = leaveQuotaController;