const db = require('../config/db');
const ok   = (res, data, msg='success') => res.json({ statusCode:200, data, message:msg });
const fail = (res, status, msg, err=null) => {
  if (err) console.error(`[other-income] ${msg}:`, err.message);
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
      const { month, search, status, page=1, limit=10 } = req.query;

      let where = ['1=1'];
      let params = [];
      if (month)  { where.push("DATE_FORMAT(o.month,'%Y-%m')=?"); params.push(month); }
      if (search) { where.push("(e.full_name LIKE ? OR e.employee_code LIKE ?)"); params.push(`%${search}%`,`%${search}%`); }

      const [[{total}]] = await db.query(
        `SELECT COUNT(*) as total FROM hr_other_income o JOIN hr_employees e ON e.id=o.employee_id WHERE ${where.join(' AND ')}`, params);

      const [rows] = await db.query(`
        SELECT o.id, o.employee_id, DATE_FORMAT(o.month,'%Y-%m') as month,
               o.type, o.description, o.amount, o.source, o.date,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar,
               d.id as dept_id, d.name as dept_name,
               DATE_FORMAT(o.created_at,'%Y-%m-%dT%H:%i:%sZ') as created_at
        FROM hr_other_income o
        JOIN hr_employees e ON e.id=o.employee_id
        LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
        LEFT JOIN cat_departments d ON d.code=rsd.department_code
        WHERE ${where.join(' AND ')}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      ok(res, {
        data: rows.map(r => ({
          id: String(r.id),
          staff: { id: String(r.employee_id), name: r.staff_name, code: r.staff_code, avatar: r.avatar,
            departments: r.dept_name ? [{ id:'', name: r.dept_name }] : [], rooms: [] },
          month: r.month, type: r.type||'OTHER_INCOME',
          description: r.description||'', amount: parseFloat(r.amount||0),
          source: r.source||'WEB', date: r.date||null, createdAt: r.created_at,
          entryPerson: { id:'', name:'' },
        })),
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(total/limit) }
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy thu nhập khác', e); }
  },
  getById: async (req, res) => {
    try {
      const [[o]] = await db.query(`SELECT o.*, e.employee_code, e.full_name, e.avatar FROM hr_other_income o JOIN hr_employees e ON e.id=o.employee_id WHERE o.id=?`, [req.params.id]);
      if (!o) return fail(res, 404, 'Không tìm thấy');
      const [depts] = await db.query(`SELECT d.id, d.name FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id=?`, [o.employee_id]);
      const [rooms] = await db.query(`SELECT rm.id, rm.name FROM hr_staff_rooms rsr JOIN cat_rooms rm ON rm.code=rsr.room_code WHERE rsr.employee_id=?`, [o.employee_id]);
      ok(res, { id:String(o.id), month: o.month?.toISOString?.()?.slice(0,7)||o.month,
        type:o.type, description:o.description, amount:parseFloat(o.amount||0),
        source:o.source, date:o.date,
        staff: { id:String(o.employee_id), name:o.full_name, code:o.employee_code, avatar:o.avatar,
          departments: depts.map(d=>({id:String(d.id),name:d.name})),
          rooms: rooms.map(rm=>({id:String(rm.id),name:rm.name})) }
      });
    } catch(e) { fail(res, 500, 'Lỗi', e); }
  },
  create: async (req, res) => {
    try {
      const { staffId, month, type, description, amount, source, entryPersonId, date } = req.body;
      const monthDate = month ? `${month}-01` : null;
      const entryId = entryPersonId && !isNaN(parseInt(entryPersonId)) ? parseInt(entryPersonId) : null;
      const [r] = await db.query(
        `INSERT INTO hr_other_income (employee_id, month, type, description, amount, source, entry_person_id, date) VALUES (?,?,?,?,?,?,?,?)`,
        [staffId, monthDate, type||'OTHER_INCOME', description||'', amount||0, source||'WEB', entryId, date||null]
      );
      ok(res, { id: String(r.insertId) }, 'Tạo thành công');
    } catch(e) { fail(res, 500, 'Lỗi tạo thu nhập', e); }
  },
  update: async (req, res) => {
    try {
      console.log('[other-income] UPDATE body:', JSON.stringify(req.body));
      const { staffId, month, type, description, amount, source, entryPersonId, date } = req.body;
      const monthDate = month ? `${month}-01` : null;
      const entryId2 = entryPersonId && !isNaN(parseInt(entryPersonId)) ? parseInt(entryPersonId) : null;
      await db.query(
        `UPDATE hr_other_income SET employee_id=COALESCE(?,employee_id), month=COALESCE(?,month), type=?,description=?,amount=?,source=?,entry_person_id=?,date=? WHERE id=?`,
        [staffId||null, monthDate, type||'OTHER_INCOME', description||'', amount||0, source||'WEB', entryId2, date||null, req.params.id]
      );
      ok(res, null, 'Cập nhật thành công');
    } catch(e) { fail(res, 500, 'Lỗi cập nhật', e); }
  },
  remove: async (req, res) => {
    try {
      await db.query(`DELETE FROM hr_other_income WHERE id=?`, [req.params.id]);
      ok(res, null, 'Xóa thành công');
    } catch(e) { fail(res, 500, 'Lỗi xóa', e); }
  },
};