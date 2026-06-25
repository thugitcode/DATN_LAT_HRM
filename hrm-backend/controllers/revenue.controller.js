const db = require('../config/db');
const ok   = (res, data, msg='success') => res.json({ statusCode:200, data, message:msg });
const fail = (res, status, msg, err=null) => {
  if (err) console.error(`[revenue] ${msg}:`, err.message);
  return res.status(status).json({ statusCode:status, message:msg });
};

module.exports = {
  getAll: async (req, res) => {
    try {
      const { month, search, status, page=1, limit=10 } = req.query;
      let where = ['1=1'], params = [];
      if (month)  { where.push("DATE_FORMAT(r.month,'%Y-%m')=?"); params.push(month); }
      if (search) { where.push("(e.full_name LIKE ? OR e.employee_code LIKE ?)"); params.push(`%${search}%`,`%${search}%`); }
      if (status) { where.push("r.status=?"); params.push(status); }

      const [[{total}]] = await db.query(
        `SELECT COUNT(*) as total FROM hr_staff_revenue r JOIN hr_employees e ON e.id=r.employee_id WHERE ${where.join(' AND ')}`, params);

      const [rows] = await db.query(`
        SELECT r.id, r.employee_id, DATE_FORMAT(r.month,'%Y-%m') as month,
               r.target_amount, r.actual_amount, r.achievement_rate, r.source, r.status, r.note,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar,
               d.id as dept_id, d.name as dept_name,
               DATE_FORMAT(r.created_at,'%Y-%m-%dT%H:%i:%sZ') as created_at
        FROM hr_staff_revenue r
        JOIN hr_employees e ON e.id=r.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
        LEFT JOIN cat_departments d ON d.code=rsd.department_code
        WHERE ${where.join(' AND ')}
        GROUP BY r.id ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      ok(res, {
        data: rows.map(r => ({
          id: String(r.id),
          staff: { id: String(r.employee_id), name: r.staff_name, code: r.staff_code, avatar: r.avatar,
            departments: r.dept_name ? [{ id: String(r.dept_id||''), name: r.dept_name }] : [], rooms: [] },
          month: r.month,
          targetAmount: parseFloat(r.target_amount||0),
          actualAmount: parseFloat(r.actual_amount||0),
          achievementRate: parseFloat(r.achievement_rate||0),
          source: r.source||'WEB', status: r.status||'PENDING', note: r.note||'', createdAt: r.created_at,
        })),
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(total/limit) }
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy doanh số', e); }
  },

  getById: async (req, res) => {
    try {
      const [[r]] = await db.query(`
        SELECT rv.*, e.employee_code as staff_code, e.full_name as staff_name, e.avatar,
               DATE_FORMAT(rv.month,'%Y-%m') as month_str
        FROM hr_staff_revenue rv
        JOIN hr_employees e ON e.id=rv.employee_id
        WHERE rv.id=?
      `, [req.params.id]);
      if (!r) return fail(res, 404, 'Không tìm thấy');

      const [depts] = await db.query(
        `SELECT d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id=?`,
        [r.employee_id]);
      const [rooms] = await db.query(
        `SELECT rm.id, rm.name FROM hr_staff_rooms rsr JOIN cat_rooms rm ON rm.code=rsr.room_code WHERE rsr.employee_id=?`,
        [r.employee_id]);

      ok(res, {
        id: String(r.id),
        staff: { id: String(r.employee_id), name: r.staff_name, code: r.staff_code, avatar: r.avatar,
          departments: depts.map(d=>({id:String(d.id), name:d.name})),
          rooms: rooms.map(rm=>({id:String(rm.id), name:rm.name})) },
        month: r.month_str,
        targetAmount: parseFloat(r.target_amount||0),
        actualAmount: parseFloat(r.actual_amount||0),
        achievementRate: parseFloat(r.achievement_rate||0),
        source: r.source||'WEB', status: r.status||'PENDING', note: r.note||'',
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy chi tiết doanh số', e); }
  },

  create: async (req, res) => {
    try {
      const { staffId, month, targetAmount, actualAmount, achievementRate, source, status } = req.body;
      const monthDate = month ? `${month}-01` : null;
      const [r] = await db.query(
        `INSERT INTO hr_staff_revenue (employee_id, month, target_amount, actual_amount, achievement_rate, source, status) VALUES (?,?,?,?,?,?,?)`,
        [staffId, monthDate, targetAmount||0, actualAmount||0, achievementRate||0, source||'WEB', status||'PENDING']
      );
      ok(res, { id: String(r.insertId) }, 'Tạo thành công');
    } catch(e) { fail(res, 500, 'Lỗi tạo doanh số', e); }
  },

  update: async (req, res) => {
    try {
      const { targetAmount, actualAmount, achievementRate, status } = req.body;
      await db.query(
        `UPDATE hr_staff_revenue SET target_amount=?,actual_amount=?,achievement_rate=?,status=? WHERE id=?`,
        [targetAmount||0, actualAmount||0, achievementRate||0, status||'PENDING', req.params.id]);
      ok(res, null, 'Cập nhật thành công');
    } catch(e) { fail(res, 500, 'Lỗi cập nhật', e); }
  },

  remove: async (req, res) => {
    try {
      await db.query(`DELETE FROM hr_staff_revenue WHERE id=?`, [req.params.id]);
      ok(res, null, 'Xóa thành công');
    } catch(e) { fail(res, 500, 'Lỗi xóa', e); }
  },
};