const db = require('../config/db');

const ok   = (res, data, msg = 'success') => res.json({ statusCode: 200, data, message: msg });
const fail = (res, status, msg, err = null) => {
  if (err) console.error(`[work-schedule] ${msg}:`, err.message);
  return res.status(status).json({ statusCode: status, message: msg });
};

// ─── helpers ────────────────────────────────────────────────
function getLastDay(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).toISOString().slice(0, 10);
}
function getDateRange(from, to) {
  const dates = [], cur = new Date(from), end = new Date(to);
  while (cur <= end) { dates.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
  return dates;
}
function statusCode(s) {
  return { SCHEDULED:'SC', PRESENT:'P', ABSENT:'AB', LATE:'L', EARLY_LEAVE:'EL',
           MISSING_CHECKIN:'MCI', MISSING_CHECKOUT:'MCO', HOLIDAY:'H', LEAVE:'LV', ON_CALL:'OC' }[s] || s;
}
function buildSummary(details) {
  return {
    totalWork: details.length, workDays: details.filter(d=>d.status==='PRESENT').length,
    actualWorkDays: details.filter(d=>['PRESENT','LATE','EARLY_LEAVE'].includes(d.status)).length,
    absentDays: details.filter(d=>d.status==='ABSENT').length,
    totalLateMinutes:0, totalEarlyMinutes:0,
    holiday: details.filter(d=>d.status==='HOLIDAY').length,
    onCall: details.filter(d=>d.status==='ON_CALL').length,
    paidLeave: details.filter(d=>d.status==='LEAVE').length,
    otherLeave:0, overtimeHours:0, totalAttendance: details.filter(d=>d.check_in_time).length,
    compHours:0, compLeave:0, compRest:0, socialInsuranceLeave:0, unpaidLeave:0,
    violationCount: details.filter(d=>['LATE','EARLY_LEAVE','MISSING_CHECKIN','MISSING_CHECKOUT'].includes(d.status)).length,
    totalWorkHours:0,
  };
}

// Lấy danh sách nhân viên với filter
async function getStaffList(query) {
  const { staffId, departmentId, roomId, search, page = 1, limit = 20 } = query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = ["e.status != 'RESIGNED'"];
  let params = [];
  if (staffId)     { where.push('e.id = ?'); params.push(staffId); }
  if (search)      { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
  if (departmentId){ where.push('rsd.department_code = (SELECT code FROM cat_departments WHERE id=?)'); params.push(departmentId); }
  if (roomId)      { where.push('rsr.room_code = (SELECT code FROM cat_rooms WHERE id=?)'); params.push(roomId); }

  const [[{total}]] = await db.query(
    `SELECT COUNT(DISTINCT e.id) as total FROM hr_employees e
     LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
     LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id=e.id
     WHERE ${where.join(' AND ')}`, params
  );

  const [staff] = await db.query(`
    SELECT DISTINCT e.id, e.employee_code as code, e.full_name as name, e.avatar
    FROM hr_employees e
    LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
    LEFT JOIN hr_staff_rooms rsr ON rsr.employee_id=e.id
    WHERE ${where.join(' AND ')}
    ORDER BY e.full_name
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);

  return { staff, total: parseInt(total) };
}

// Lấy departments và rooms cho list staff
async function getStaffDeptRooms(staffIds) {
  if (!staffIds.length) return { depts: [], rooms: [] };
  const [depts] = await db.query(
    `SELECT rsd.employee_id, d.id, d.name FROM hr_staff_departments rsd
     JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id IN (?)`, [staffIds]
  );
  const [rooms] = await db.query(
    `SELECT rsr.employee_id, r.id, r.name FROM hr_staff_rooms rsr
     JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id IN (?)`, [staffIds]
  );
  return { depts, rooms };
}

// ─── controllers ────────────────────────────────────────────
const workScheduleController = {

  // GET /work-schedule?startDate=&endDate=&departmentId=&roomId=&search=&page=&limit=
  getAll: async (req, res) => {
    try {
      const { startDate, endDate, fromDate, toDate, month, page = 1, limit = 20 } = req.query;
      const filterFrom = startDate || fromDate || (month ? `${month}-01` : null);
      const filterTo   = endDate   || toDate   || (month ? getLastDay(month) : null);

      const { staff, total } = await getStaffList(req.query);
      if (!staff.length) return res.json({
        statusCode:200, data:{data:[],shiftTypesCount:{},summary:{}},
        pagination:{total:0,page:parseInt(page),limit:parseInt(limit)}, metadata:null, message:'success'
      });

      const staffIds = staff.map(s => s.id);
      const { depts, rooms } = await getStaffDeptRooms(staffIds);

      // Lấy schedule details trong khoảng ngày
      let scheduleDetails = [];
      if (filterFrom && filterTo) {
        [scheduleDetails] = await db.query(`
          SELECT wsd.id, wsd.work_schedule_id, wsd.shift_template_id, wsd.work_date,
                 wsd.start_time, wsd.end_time, wsd.check_in_time, wsd.check_out_time,
                 wsd.status, wsd.work_weight, wsd.note,
                 ws.employee_id,
                 st.name as shift_name, st.code as shift_code, st.shift_type,
                 st.start_time as shift_start, st.end_time as shift_end
          FROM hr_work_schedule_details wsd
          JOIN hr_work_schedules ws ON ws.id = wsd.work_schedule_id
          JOIN shifts st ON st.id = wsd.shift_template_id
          WHERE ws.employee_id IN (?) AND wsd.work_date BETWEEN ? AND ?
          ORDER BY wsd.work_date, wsd.start_time
        `, [staffIds, filterFrom, filterTo]);
      }

      const gridData = staff.map(s => {
        const sdList = scheduleDetails.filter(d => d.employee_id === s.id);
        const byDate = {};
        sdList.forEach(d => {
          const date = d.work_date;
          if (!byDate[date]) byDate[date] = { date, dayOfWeek: new Date(date).getDay(), shifts: [] };
          byDate[date].shifts.push({
            id: String(d.id),
            workScheduleDetailId: String(d.id),
            workScheduleId: String(d.work_schedule_id),
            shiftTemplateId: String(d.shift_template_id),
            shiftTemplateName: d.shift_name,
            shiftTemplateCode: d.shift_code,
            shiftTemplateType: d.shift_type,
            startTime: d.shift_start,
            endTime: d.shift_end,
            status: d.status,
            checkInTime: d.check_in_time || null,
            checkOutTime: d.check_out_time || null,
          });
        });

        const shiftTypesCount = { FIXED: 0, FLEXIBLE: 0, ON_CALL: 0, SPLIT: 0 };
        sdList.forEach(d => { if (shiftTypesCount[d.shift_type] !== undefined) shiftTypesCount[d.shift_type]++; });

        return {
          staff: {
            id: String(s.id), code: s.code, name: s.name, avatar: s.avatar,
            position: '',
            departments: depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
            rooms: rooms.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
            status: 'ACTIVE',
          },
          schedules: Object.values(byDate),
          shiftTypesCount,
        };
      });

      return res.json({
        statusCode: 200,
        data: {
          data: gridData,
          shiftTypesCount: { FIXED: 0, FLEXIBLE: 0, ON_CALL: 0, SPLIT: 0 },
          summary: {},
        },
        pagination: { total, page: parseInt(page), limit: parseInt(limit) },
        metadata: null,
        message: 'success',
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy danh sách phân ca', e); }
  },

  // GET /work-schedule/calendar — alias cho getAll dạng calendar
  getCalendar: async (req, res) => {
    return workScheduleController.getAll(req, res);
  },

  // POST /work-schedule — tạo phân ca + tự sinh chấm công
  create: async (req, res) => {
    try {
      const { staffId, departmentId, roomId, fromDate, toDate, note, details } = req.body;
      if (!staffId || !details?.length) return fail(res, 400, 'Thiếu thông tin phân ca');

      const [ws] = await db.query(
        `INSERT INTO hr_work_schedules (employee_id, department_id, room_id, from_date, to_date, note) VALUES (?,?,?,?,?,?)`,
        [staffId, departmentId||null, roomId||null, fromDate, toDate, note||null]
      );
      const wsId = ws.insertId;

      const dates = getDateRange(fromDate, toDate);
      for (const date of dates) {
        for (const d of details) {
          const [wsd] = await db.query(
            `INSERT INTO hr_work_schedule_details (work_schedule_id, employee_id, shift_template_id, work_date, start_time, end_time, note) VALUES (?,?,?,?,?,?,?)`,
            [wsId, staffId, d.shiftTemplateId, date, d.startTime, d.endTime, d.note||null]
          );
          // Tự sinh chấm công từ ca
          await generateAttendance(staffId, wsd.insertId, date, d.shiftTemplateId, d.startTime);
        }
      }

      ok(res, { id: String(wsId) }, 'Thêm phân ca thành công');
    } catch (e) { fail(res, 500, 'Lỗi tạo phân ca', e); }
  },

  // POST /work-schedule/range — phân ca nhiều ngày + tự sinh chấm công
  createRange: async (req, res) => {
    try {
      const { staffId, departmentId, roomId, fromDate, toDate, note, details } = req.body;
      if (!staffId || !details?.length) return fail(res, 400, 'Thiếu thông tin phân ca');

      const [ws] = await db.query(
        `INSERT INTO hr_work_schedules (employee_id, department_id, room_id, from_date, to_date, note) VALUES (?,?,?,?,?,?)`,
        [staffId, departmentId||null, roomId||null, fromDate, toDate, note||null]
      );
      const wsId = ws.insertId;

      const dates = getDateRange(fromDate, toDate);
      for (const date of dates) {
        for (const d of details) {
          const [wsd] = await db.query(
            `INSERT INTO hr_work_schedule_details (work_schedule_id, employee_id, shift_template_id, work_date, start_time, end_time, note) VALUES (?,?,?,?,?,?,?)`,
            [wsId, staffId, d.shiftTemplateId, date, d.startTime, d.endTime, d.note||null]
          );
          await generateAttendance(staffId, wsd.insertId, date, d.shiftTemplateId, d.startTime);
        }
      }

      ok(res, { id: String(wsId) }, 'Thêm phân ca thành công');
    } catch (e) { fail(res, 500, 'Lỗi tạo phân ca nhiều ngày', e); }
  },

  // GET /work-schedule/:id
  getById: async (req, res) => {
    try {
      const [[ws]] = await db.query(`
        SELECT ws.*, e.employee_code as staff_code, e.full_name as staff_name
        FROM hr_work_schedules ws JOIN hr_employees e ON e.id=ws.employee_id
        WHERE ws.id=?`, [req.params.id]);
      if (!ws) return fail(res, 404, 'Không tìm thấy phân ca');
      const [details] = await db.query(`
        SELECT wsd.*, st.name as shift_name, st.code as shift_code, st.shift_type
        FROM hr_work_schedule_details wsd JOIN shifts st ON st.id=wsd.shift_template_id
        WHERE wsd.work_schedule_id=? ORDER BY wsd.work_date`, [req.params.id]);
      ok(res, { ...ws, details });
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết phân ca', e); }
  },

  // PATCH /work-schedule/:id
  update: async (req, res) => {
    try {
      const { roomId, departmentId, note, status, details } = req.body;
      await db.query(
        `UPDATE hr_work_schedules SET room_id=?,department_id=?,note=?,status=? WHERE id=?`,
        [roomId||null, departmentId||null, note||null, status||'SCHEDULED', req.params.id]
      );
      if (details?.length) {
        await db.query(`DELETE FROM hr_work_schedule_details WHERE work_schedule_id=?`, [req.params.id]);
        const [[ws]] = await db.query(`SELECT employee_id,from_date,to_date FROM hr_work_schedules WHERE id=?`, [req.params.id]);
        const dates = getDateRange(ws.from_date, ws.to_date);
        for (const date of dates) {
          for (const d of details) {
            const [wsd] = await db.query(
              `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time,note) VALUES (?,?,?,?,?,?,?)`,
              [req.params.id, ws.employee_id, d.shiftTemplateId, date, d.startTime, d.endTime, d.note||null]
            );
            await generateAttendance(ws.employee_id, wsd.insertId, date, d.shiftTemplateId, d.startTime);
          }
        }
      }
      ok(res, null, 'Cập nhật phân ca thành công');
    } catch (e) { fail(res, 500, 'Lỗi cập nhật phân ca', e); }
  },

  // GET /work-schedule/attendance-table | /detailed-attendance-table
  getAttendanceTable: async (req, res) => {
    try {
      const { month, departmentId, roomId, staffId, search } = req.query;
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`;
      const toDate   = getLastDay(currentMonth);

      const { staff, total } = await getStaffList({ ...req.query, page, limit });
      if (!staff.length) return ok(res, []);

      const staffIds = staff.map(s => s.id);
      const { depts, rooms } = await getStaffDeptRooms(staffIds);

      const [details] = await db.query(`
        SELECT wsd.id, wsd.work_date, wsd.start_time, wsd.end_time,
               wsd.check_in_time, wsd.check_out_time, wsd.status, wsd.work_weight,
               ws.employee_id,
               st.name as shift_name, st.code as shift_code, st.shift_type,
               st.start_time as shift_start, st.end_time as shift_end,
               st.id as shift_template_id
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        JOIN shifts st ON st.id=wsd.shift_template_id
        WHERE ws.employee_id IN (?) AND wsd.work_date BETWEEN ? AND ?
        ORDER BY wsd.work_date
      `, [staffIds, fromDate, toDate]);

      const result = staff.map(s => {
        const sd = details.filter(d => d.employee_id === s.id);
        const byShift = {};
        sd.forEach(d => {
          const key = d.shift_template_id;
          if (!byShift[key]) byShift[key] = {
            shift: { id:String(d.shift_template_id), code:d.shift_code, name:d.shift_name,
                     startTime:d.shift_start, endTime:d.shift_end, breakTimes:[] },
            days: {}, summary: buildSummary([]),
          };
          byShift[key].days[d.work_date] = {
            workScheduleDetailId: String(d.id), date: d.work_date,
            displayCode: statusCode(d.status),
            shiftStartTime: d.shift_start, shiftEndTime: d.shift_end,
            checkInTime: d.check_in_time||null, checkOutTime: d.check_out_time||null,
            status: d.status, workWeight: parseFloat(d.work_weight)||1,
          };
        });
        Object.values(byShift).forEach(g => {
          g.summary = buildSummary(sd.filter(d=>d.shift_template_id===parseInt(g.shift.id)));
        });

        return {
          staff: {
            id:String(s.id), code:s.code, name:s.name, avatar:s.avatar, status:'ACTIVE',
            departments: depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
            rooms: rooms.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
          },
          shifts: Object.values(byShift),
          summary: buildSummary(sd),
        };
      });

      ok(res, result);
    } catch (e) { fail(res, 500, 'Lỗi lấy bảng chấm công', e); }
  },

  // GET /work-schedule/attendance-by-hours
  getAttendanceByHours: async (req, res) => {
    try {
      const { month, departmentId, roomId, staffId } = req.query;
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`;
      const toDate   = getLastDay(currentMonth);

      const { staff, total } = await getStaffList({ ...req.query, page, limit });
      if (!staff.length) return ok(res, []);

      const staffIds = staff.map(s => s.id);
      const { depts, rooms } = await getStaffDeptRooms(staffIds);

      const [details] = await db.query(`
        SELECT ws.employee_id, wsd.work_date, wsd.check_in_time, wsd.check_out_time, wsd.status,
               TIMESTAMPDIFF(MINUTE, wsd.check_in_time, wsd.check_out_time) as worked_minutes
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        WHERE ws.employee_id IN (?) AND wsd.work_date BETWEEN ? AND ?
      `, [staffIds, fromDate, toDate]);

      const result = staff.map(s => {
        const sd = details.filter(d => d.employee_id === s.id);
        const days = {};
        sd.forEach(d => {
          const h = d.worked_minutes ? Math.round(d.worked_minutes/60*100)/100 : 0;
          days[d.work_date] = { date:d.work_date, dayOfWeek:new Date(d.work_date).getDay(), hours:h, status:d.status };
        });
        return {
          staffId:String(s.id), staffCode:s.code, staffName:s.name,
          position:'',
          departments: depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
          rooms: rooms.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
          days,
          totalHours: Object.values(days).reduce((s,d)=>s+d.hours,0),
          standardHours: 8 * Object.keys(days).length,
        };
      });

      ok(res, result);
    } catch (e) { fail(res, 500, 'Lỗi lấy chấm công theo giờ', e); }
  },

  // GET /work-schedule/work-schedule-detail/:id
  getDetail: async (req, res) => {
    try {
      const [[d]] = await db.query(`
        SELECT wsd.*, ws.employee_id, ws.department_id, ws.room_id,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar,
               st.name as shift_name, st.code as shift_code, st.shift_type,
               dep.name as department_name, r.name as room_name
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        JOIN hr_employees e ON e.id=ws.employee_id
        JOIN shifts st ON st.id=wsd.shift_template_id
        LEFT JOIN cat_departments dep ON dep.id=ws.department_id
        LEFT JOIN cat_rooms r ON r.id=ws.room_id
        WHERE wsd.id=?`, [req.params.id]);
      if (!d) return fail(res, 404, 'Không tìm thấy chi tiết chấm công');
      ok(res, d);
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết chấm công', e); }
  },

  // PATCH /work-schedule/detail/:id/attendance
  updateAttendance: async (req, res) => {
    try {
      const { checkInTime, checkOutTime, status, note } = req.body;
      await db.query(
        `UPDATE hr_work_schedule_details SET check_in_time=?,check_out_time=?,status=?,note=? WHERE id=?`,
        [checkInTime||null, checkOutTime||null, status||'PRESENT', note||null, req.params.id]
      );
      ok(res, null, 'Cập nhật chấm công thành công');
    } catch (e) { fail(res, 500, 'Lỗi cập nhật chấm công', e); }
  },

  // GET /work-schedule/staff-daily-attendance?staffId=&month=
  getStaffDailyAttendance: async (req, res) => {
    try {
      const { staffId, month } = req.query;
      if (!staffId) return fail(res, 400, 'Thiếu staffId');
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`;
      const toDate   = getLastDay(currentMonth);

      const [details] = await db.query(`
        SELECT wsd.id, wsd.work_date, wsd.start_time, wsd.end_time,
               wsd.check_in_time, wsd.check_out_time, wsd.status, wsd.work_weight, wsd.note,
               st.name as shift_name, st.code as shift_code, st.shift_type,
               st.start_time as shift_start, st.end_time as shift_end
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        JOIN shifts st ON st.id=wsd.shift_template_id
        WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
        ORDER BY wsd.work_date, wsd.start_time
      `, [staffId, fromDate, toDate]);

      const byDate = {};
      details.forEach(d => {
        if (!byDate[d.work_date]) byDate[d.work_date] = { date:d.work_date, dayOfWeek:new Date(d.work_date).getDay(), shifts:[] };
        byDate[d.work_date].shifts.push({
          id:String(d.id), shiftName:d.shift_name, shiftCode:d.shift_code, shiftType:d.shift_type,
          startTime:d.shift_start, endTime:d.shift_end,
          checkInTime:d.check_in_time, checkOutTime:d.check_out_time,
          status:d.status, workWeight:parseFloat(d.work_weight)||1,
        });
      });

      ok(res, Object.values(byDate));
    } catch (e) { fail(res, 500, 'Lỗi lấy chấm công nhân viên', e); }
  },
};

// ─── Mock Attendance Generator ───────────────────────────────
// Tự sinh giờ chấm công dựa trên ca làm việc
async function generateAttendance(employeeId, wsdId, date, shiftTemplateId, startTime) {
  try {
    // Lấy thông tin ca
    const [[shift]] = await db.query(`SELECT code, shift_type, start_time, end_time FROM shifts WHERE id=?`, [shiftTemplateId]);
    if (!shift) return;

    const code = (shift.code || '').toUpperCase();
    const st   = shift.start_time || startTime || '07:00:00';
    let checkIn, checkOut;

    // Quy tắc sinh giờ theo loại ca
    if (code.startsWith('HC') || st.startsWith('07') || st.startsWith('08')) {
      checkIn  = `${date} 07:55:00`;
      checkOut = `${date} 17:05:00`;
    } else if (code.startsWith('S') || st.startsWith('05') || st.startsWith('06')) {
      checkIn  = `${date} 05:55:00`;
      checkOut = `${date} 14:05:00`;
    } else if (code.startsWith('C') || st.startsWith('13') || st.startsWith('14')) {
      checkIn  = `${date} 13:55:00`;
      checkOut = `${date} 22:05:00`;
    } else if (code.startsWith('D') || code.startsWith('Đ') || st.startsWith('21') || st.startsWith('22')) {
      checkIn  = `${date} 21:55:00`;
      // checkout ngày hôm sau
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOut = `${nextDay.toISOString().slice(0,10)} 06:05:00`;
    } else {
      // Ca khác: check in đúng giờ, check out sau 8 tiếng
      const [h, m] = st.split(':').map(Number);
      const checkInH = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
      const outH = (h + 8) % 24;
      const nextD = h + 8 >= 24 ? (() => { const d2=new Date(date); d2.setDate(d2.getDate()+1); return d2.toISOString().slice(0,10); })() : date;
      checkIn  = `${date} ${checkInH}`;
      checkOut = `${nextD} ${String(outH).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
    }

    // Cập nhật vào hr_work_schedule_details
    await db.query(
      `UPDATE hr_work_schedule_details SET check_in_time=?, check_out_time=?, status='PRESENT' WHERE id=?`,
      [checkIn, checkOut, wsdId]
    );
  } catch (e) {
    console.error('[generateAttendance] Error:', e.message);
  }
}

module.exports = workScheduleController;