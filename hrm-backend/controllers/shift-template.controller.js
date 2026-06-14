const db = require('../config/db');

// FE dùng ShiftTemplate type với các fields: id, code, name, type, startTime, endTime,
// coefficient, standardHours, color, allowedLateMinutes, allowedEarlyLeaveMinutes...
const mapShift = (row) => ({
  id:                     String(row.id),
  code:                   row.code,
  name:                   row.name,
  type:                   row.shift_type,      // FIXED | ON_CALL | FLEXIBLE
  startTime:              row.start_time ? String(row.start_time).substring(0,5) : null,
  endTime:                row.end_time   ? String(row.end_time).substring(0,5)   : null,
  standardHours:          row.work_hours  || 8,
  coefficient:            parseFloat(row.coefficient) || 1,
  allowedLateMinutes:     row.late_allowance  || 0,
  allowedEarlyLeaveMinutes: row.early_allowance || 0,
  handoverTime:           row.handover_time   || 0,
  dutyAllowance:          row.allowance       || 0,
  compensatoryType:       row.comp_type       || 'SHIFT',
  compensatoryCoefficient:parseFloat(row.comp_coefficient) || 1,
  restTimeAfterShift:     row.rest_time_after || 0,
  status:                 row.status,
  color:                  row.color           || '#6576FF',
  breakTimes:             row.break_times ? JSON.parse(row.break_times) : [],
  createdAt:              row.created_at || null,
  updatedAt:              row.updated_at || null,
});

const shiftTemplateController = {

  // GET /shift-template?getAll=true&type=FIXED&status=ACTIVE
  getAll: async (req, res) => {
    try {
      const { getAll, type, status, search, page = 1, limit = 20 } = req.query;

      const conditions = [];
      const params = [];

      if (type)   { conditions.push('shift_type = ?'); params.push(type); }
      if (status) { conditions.push('status = ?');     params.push(status); }
      if (search) { conditions.push('(code LIKE ? OR name LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      if (getAll === 'true' || getAll === '1') {
        const [rows] = await db.query(`SELECT * FROM shifts ${where} ORDER BY name ASC`, params);
        return res.status(200).json({ statusCode: 200, data: rows.map(mapShift) });
      }

      const offset = (Number(page) - 1) * Number(limit);
      const [rows] = await db.query(`SELECT * FROM shifts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
      const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM shifts ${where}`, params);

      res.status(200).json({
        statusCode: 200,
        data: rows.map(mapShift),
        pagination: {
          page: Number(page), limit: Number(limit), total: Number(total),
          totalPage: Math.ceil(total / Number(limit)),
          hasPreviousPage: Number(page) > 1,
          hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
        }
      });
    } catch (e) {
      console.error('[GET /shift-template]', e);
      res.status(500).json({ statusCode: 500, message: 'Lỗi lấy danh sách ca', error: e.message });
    }
  },

  // GET /shift-template/:id
  getById: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM shifts WHERE id = ? LIMIT 1', [req.params.id]);
      if (!rows.length) return res.status(404).json({ statusCode: 404, message: 'Không tìm thấy ca' });
      res.status(200).json({ statusCode: 200, data: mapShift(rows[0]) });
    } catch (e) {
      res.status(500).json({ statusCode: 500, message: 'Lỗi lấy chi tiết ca', error: e.message });
    }
  },
};

module.exports = shiftTemplateController;