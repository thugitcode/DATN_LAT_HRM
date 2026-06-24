const db = require('../config/db');
const ok   = (res, data, msg='success') => res.json({ statusCode:200, data, message:msg });
const fail = (res, status, msg, err=null) => {
  if (err) console.error(`[other-income] ${msg}:`, err.message);
  return res.status(status).json({ statusCode:status, message:msg });
};

module.exports = {
  getAll: async (req, res) => {
    try {
      const { month, search, page=1, limit=10 } = req.query;
      const [rows] = await db.query(`
        SELECT oi.*, e.employee_code as staff_code, e.full_name as staff_name
        FROM hr_other_income oi
        JOIN hr_employees e ON e.id=oi.employee_id
        WHERE (? IS NULL OR DATE_FORMAT(oi.month,'%Y-%m')=?)
        ORDER BY oi.created_at DESC
        LIMIT ? OFFSET ?
      `, [month||null, month||null, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]);

      const [[{total}]] = await db.query(`SELECT COUNT(*) as total FROM hr_other_income`);
      ok(res, {
        data: rows.map(r => ({
          id: String(r.id),
          staff: { id: String(r.employee_id), name: r.staff_name, code: r.staff_code },
          departments: [], rooms: [],
          month: r.month, type: r.type, description: r.description,
          amount: parseFloat(r.amount||0), source: r.source||'WEB',
          entryPerson: { id:'', name:'' }, date: r.date,
          allowance: null, attachments: [], createdAt: r.created_at,
        })),
        pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(total/limit) }
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy thu nhập khác', e); }
  },

  getById: async (req, res) => {
    try {
      const [[r]] = await db.query(`SELECT * FROM hr_other_income WHERE id=?`, [req.params.id]);
      if (!r) return fail(res, 404, 'Không tìm thấy');
      ok(res, r);
    } catch(e) { fail(res, 500, 'Lỗi', e); }
  },

  create: async (req, res) => {
    try {
      const { staffId, month, type, description, amount, source, date } = req.body;
      const [r] = await db.query(
        `INSERT INTO hr_other_income (employee_id,month,type,description,amount,source,date) VALUES (?,?,?,?,?,?,?)`,
        [staffId, month, type, description, amount, source||'WEB', date]
      );
      ok(res, { id: String(r.insertId) }, 'Tạo thành công');
    } catch(e) { fail(res, 500, 'Lỗi tạo thu nhập khác', e); }
  },

  update: async (req, res) => {
    try {
      const { type, description, amount } = req.body;
      await db.query(`UPDATE hr_other_income SET type=?,description=?,amount=? WHERE id=?`,
        [type, description, amount, req.params.id]);
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