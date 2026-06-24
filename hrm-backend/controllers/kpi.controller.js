const db = require('../config/db');
const ok   = (res, data, msg='success') => res.json({ statusCode:200, data, message:msg });
const fail = (res, status, msg, err=null) => {
  if (err) console.error(`[kpi] ${msg}:`, err.message);
  return res.status(status).json({ statusCode:status, message:msg });
};

module.exports = {
  getAll: async (req, res) => {
    try {
      const { month, search, departmentId, roomId, page=1, limit=10 } = req.query;
      const [rows] = await db.query(`
        SELECT k.id, k.employee_id, k.month, k.kpi_score, k.rating, k.source, k.status,
               e.employee_code as staff_code, e.full_name as staff_name,
               DATE_FORMAT(k.created_at,'%Y-%m-%dT%H:%i:%sZ') as created_at
        FROM hr_staff_kpi k
        JOIN hr_employees e ON e.id=k.employee_id
        WHERE (? IS NULL OR DATE_FORMAT(k.month,'%Y-%m')=?)
        AND (? IS NULL OR e.full_name LIKE ? OR e.employee_code LIKE ?)
        ORDER BY k.created_at DESC
        LIMIT ? OFFSET ?
      `, [month||null, month||null, search||null, `%${search}%`, `%${search}%`,
          parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      const [[{total}]] = await db.query(`SELECT COUNT(*) as total FROM hr_staff_kpi`);
      ok(res, {
        data: rows.map(r => ({
          id: String(r.id),
          staff: { id: String(r.employee_id), name: r.staff_name, code: r.staff_code },
          departments: [], rooms: [],
          month: r.month, kpiScore: r.kpi_score, rating: r.rating,
          evaluator: { id:'', name:'' }, source: r.source||'WEB',
          status: r.status||'PENDING', createdAt: r.created_at,
        })),
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(total/limit) }
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy KPI', e); }
  },

  getById: async (req, res) => {
    try {
      const [[k]] = await db.query(`SELECT * FROM hr_staff_kpi WHERE id=?`, [req.params.id]);
      if (!k) return fail(res, 404, 'Không tìm thấy KPI');
      ok(res, k);
    } catch(e) { fail(res, 500, 'Lỗi lấy KPI', e); }
  },

  create: async (req, res) => {
    try {
      const { staffId, month, kpiScore, rating, source, status } = req.body;
      const [r] = await db.query(
        `INSERT INTO hr_staff_kpi (employee_id, month, kpi_score, rating, source, status) VALUES (?,?,?,?,?,?)`,
        [staffId, month, kpiScore, rating, source||'WEB', status||'PENDING']
      );
      ok(res, { id: String(r.insertId) }, 'Tạo KPI thành công');
    } catch(e) { fail(res, 500, 'Lỗi tạo KPI', e); }
  },

  update: async (req, res) => {
    try {
      const { kpiScore, rating, status } = req.body;
      await db.query(`UPDATE hr_staff_kpi SET kpi_score=?,rating=?,status=? WHERE id=?`,
        [kpiScore, rating, status, req.params.id]);
      ok(res, null, 'Cập nhật KPI thành công');
    } catch(e) { fail(res, 500, 'Lỗi cập nhật KPI', e); }
  },

  remove: async (req, res) => {
    try {
      await db.query(`DELETE FROM hr_staff_kpi WHERE id=?`, [req.params.id]);
      ok(res, null, 'Xóa KPI thành công');
    } catch(e) { fail(res, 500, 'Lỗi xóa KPI', e); }
  },
};