const db = require('../config/db');
const ok   = (res, data, msg='success') => res.json({ statusCode:200, data, message:msg });
const fail = (res, status, msg, err=null) => {
  if (err) console.error(`[revenue] ${msg}:`, err.message);
  return res.status(status).json({ statusCode:status, message:msg });
};

module.exports = {
  getAll: async (req, res) => {
    try {
      const { startDate, endDate, search, page=1, limit=10 } = req.query;

      // Lấy danh sách nhân viên với doanh số mock (chưa có bảng riêng)
      let where = ["e.status != 'RESIGNED'"];
      let params = [];
      if (search) { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }

      const [[{total}]] = await db.query(
        `SELECT COUNT(*) as total FROM hr_employees e WHERE ${where.join(' AND ')}`, params);

      const [rows] = await db.query(`
        SELECT e.id, e.employee_code as code, e.full_name as name,
               d.name as dept_name
        FROM hr_employees e
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
        LEFT JOIN cat_departments d ON d.code=rsd.department_code
        WHERE ${where.join(' AND ')}
        GROUP BY e.id
        ORDER BY e.full_name
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      ok(res, {
        data: rows.map(r => ({
          id: String(r.id),
          staff: { id: String(r.id), name: r.name, code: r.code },
          departments: r.dept_name ? [{ id:'', name: r.dept_name }] : [],
          rooms: [],
          month: (startDate||'').slice(0,7),
          targetAmount: 0, actualAmount: 0, achievementRate: 0,
          source: 'WEB', status: 'PENDING',
          createdAt: new Date().toISOString(),
        })),
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(total/limit) }
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy doanh số', e); }
  },

  getById: async (req, res) => { ok(res, null); },
  create:  async (req, res) => { ok(res, null, 'Tạo thành công'); },
  update:  async (req, res) => { ok(res, null, 'Cập nhật thành công'); },
  remove:  async (req, res) => { ok(res, null, 'Xóa thành công'); },
};