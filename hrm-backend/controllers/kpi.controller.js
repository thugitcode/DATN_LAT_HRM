const db = require('../config/db');
const ok   = (res, data, msg='success') => res.json({ statusCode:200, data, message:msg });
const fail = (res, status, msg, err=null) => {
  if (err) console.error(`[kpi] ${msg}:`, err.message);
  return res.status(status).json({ statusCode:status, message:msg });
};


async function getStaffDeptRooms(empId, db) {
  const [depts] = await db.query(`SELECT d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id=?`, [empId]);
  const [rooms] = await db.query(`SELECT r.id, r.name FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id=?`, [empId]);
  return {
    departments: depts.map(d=>({id:String(d.id), name:d.name})),
    rooms: rooms.map(r=>({id:String(r.id), name:r.name}))
  };
}
module.exports = {
  getAll: async (req, res) => {
    try {
      const { month, search, departmentId, roomId, status, page=1, limit=10 } = req.query;

      let where = ['1=1'];
      let params = [];
      if (month)  { where.push("DATE_FORMAT(k.month,'%Y-%m')=?"); params.push(month); }
      if (search) { where.push("(e.full_name LIKE ? OR e.employee_code LIKE ?)"); params.push(`%${search}%`,`%${search}%`); }
      if (status) { where.push("k.status=?"); params.push(status); }

      const [[{total}]] = await db.query(
        `SELECT COUNT(*) as total FROM hr_staff_kpi k JOIN hr_employees e ON e.id=k.employee_id WHERE ${where.join(' AND ')}`, params);

      const [rows] = await db.query(`
        SELECT k.id, k.employee_id, DATE_FORMAT(k.month,'%Y-%m') as month,
               k.kpi_score, k.rating, k.source, k.status, k.note,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar,
               d.id as dept_id, d.name as dept_name,
               DATE_FORMAT(k.created_at,'%Y-%m-%dT%H:%i:%sZ') as created_at
        FROM hr_staff_kpi k
        JOIN hr_employees e ON e.id=k.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
        LEFT JOIN cat_departments d ON d.code=rsd.department_code
        WHERE ${where.join(' AND ')}
        GROUP BY k.id
        ORDER BY k.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      ok(res, {
        data: rows.map(r => ({
          id: String(r.id),
          staff: { id: String(r.employee_id), name: r.staff_name, code: r.staff_code, avatar: r.avatar,
            departments: r.dept_name ? [{ id:'', name: r.dept_name }] : [], rooms: [] },
          month: r.month, kpiScore: parseFloat(r.kpi_score||0), rating: r.rating,
          evaluator: { id:'', name:'' }, source: r.source||'WEB',
          status: r.status||'PENDING', note: r.note||'', createdAt: r.created_at,
        })),
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(total/limit) }
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy KPI', e); }
  },
  getById: async (req, res) => {
    try {
      const [[k]] = await db.query(`SELECT k.*, e.employee_code, e.full_name, e.avatar FROM hr_staff_kpi k JOIN hr_employees e ON e.id=k.employee_id WHERE k.id=?`, [req.params.id]);
      if (!k) return fail(res, 404, 'Không tìm thấy KPI');
      const [depts] = await db.query(`SELECT d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id=?`, [k.employee_id]);
      const [rooms] = await db.query(`SELECT rm.id, rm.name FROM hr_staff_rooms rsr JOIN cat_rooms rm ON rm.code=rsr.room_code WHERE rsr.employee_id=?`, [k.employee_id]);
      ok(res, { id:String(k.id), month: k.month?.toISOString?.()?.slice(0,7) || k.month,
        kpiScore: parseFloat(k.kpi_score||0), rating: k.rating, source: k.source, status: k.status, note: k.note,
        evaluatorId: k.evaluator_id ? String(k.evaluator_id) : '',
        departmentId: depts.length > 0 ? String(depts[0].id) : '',
        roomId: rooms.length > 0 ? String(rooms[0].id) : '',
        staff: { id:String(k.employee_id), name:k.full_name, code:k.employee_code, avatar:k.avatar,
          departments: depts.map(d=>({id:String(d.id),name:d.name})),
          rooms: rooms.map(rm=>({id:String(rm.id),name:rm.name})) }
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy KPI', e); }
  },
  create: async (req, res) => {
    try {
      const { staffId, month, kpiScore, rating, evaluatorId, source, status, note } = req.body;
      const monthDate = month ? `${month}-01` : null;
      const [r] = await db.query(
        `INSERT INTO hr_staff_kpi (employee_id, month, kpi_score, rating, evaluator_id, source, status, note) VALUES (?,?,?,?,?,?,?,?)`,
        [staffId, monthDate, kpiScore, rating||'GOOD', evaluatorId||null, source||'WEB', status||'PENDING', note||'']
      );
      ok(res, { id: String(r.insertId) }, 'Tạo KPI thành công');
    } catch(e) { fail(res, 500, 'Lỗi tạo KPI', e); }
  },
  update: async (req, res) => {
    try {
      const { kpiScore, rating, evaluatorId, status, note } = req.body;
      await db.query(`UPDATE hr_staff_kpi SET kpi_score=?,rating=?,evaluator_id=?,status=?,note=? WHERE id=?`,
        [kpiScore, rating, evaluatorId||null, status, note||'', req.params.id]);
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