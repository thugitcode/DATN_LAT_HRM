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
function buildSummary(details, explanations = {}) {
  // explanations = { 'YYYY-MM-DD': 'APPROVED'|'REJECTED'|'PENDING' }
  // Helper: ca trực đêm
  const isNight = (d) =>
    d.shift_type === 'ON_CALL' ||
    ['D','Đ'].includes((d.shift_code||'').toUpperCase()) ||
    (d.shift_start||'').startsWith('21') || (d.shift_start||'').startsWith('22');

  // Nhóm theo status — nếu có giải trình APPROVED thì ABSENT tính như PRESENT
  const present = details.filter(d => {
    if (['PRESENT','LATE','EARLY_LEAVE'].includes(d.status)) return true;
    if (d.status === 'ABSENT' && explanations[d.work_date] === 'APPROVED') return true;
    return false;
  });
  const absent = details.filter(d =>
    d.status === 'ABSENT' && explanations[d.work_date] !== 'APPROVED'
  );
  const late  = details.filter(d =>
    d.status === 'LATE' && explanations[d.work_date] !== 'APPROVED'
  );
  const early = details.filter(d =>
    d.status === 'EARLY_LEAVE' && explanations[d.work_date] !== 'APPROVED'
  );

  // Ngày làm ca ngày vs ca trực đêm
  const workDays = present.filter(d => !isNight(d)).length;
  const onCall   = present.filter(d => isNight(d)).length;

  // Nghỉ phép hưởng lương (từ chấm công)
  const paidLeave = details.filter(d => ['LEAVE','LEAVE_PAID'].includes(d.status)).length;

  // Nghỉ bù trực
  const compRest = details.filter(d => d.status === 'COMPENSATORY_LEAVE').length;

  // Nghỉ lễ
  const holiday = details.filter(d => d.status === 'HOLIDAY').length;

  // Nghỉ khác (unpaid, social insurance...)
  const otherLeave = details.filter(d =>
    ['UNPAID_LEAVE','SOCIAL_INSURANCE_LEAVE','SICK_LEAVE'].includes(d.status)
  ).length;

  // Tính giờ làm thực tế + tăng ca + giờ bù
  let totalWorkHours = 0, overtimeHours = 0, compHours = 0;

  // Tìm các ngày sau ca trực đêm có nghỉ bù không
  const onCallDates = details
    .filter(d => isNight(d) && ['PRESENT','LATE','EARLY_LEAVE'].includes(d.status))
    .map(d => {
      const next = new Date(d.work_date); next.setDate(next.getDate() + 1);
      return next.toISOString().slice(0,10);
    });
  const compRestDates = details
    .filter(d => d.status === 'COMPENSATORY_LEAVE')
    .map(d => d.work_date);

  // Ca trực đêm không có ngày nghỉ bù → giờ trực tích vào quỹ giờ bù
  const onCallNoBu = onCallDates.filter(d => !compRestDates.includes(d));

  details.forEach(d => {
    if (!d.check_in_time || !d.check_out_time) return;
    const diff = (new Date(d.check_out_time) - new Date(d.check_in_time)) / 3600000;
    const hours = diff < 0 ? diff + 24 : diff;

    if (d.status === 'COMPENSATORY_LEAVE') {
      // Đi làm vào ngày nghỉ bù → tích vào quỹ giờ bù
      compHours += hours;
    } else if (isNight(d) && ['PRESENT','LATE','EARLY_LEAVE'].includes(d.status)) {
      totalWorkHours += hours;
      const stdHours = 9;
      overtimeHours += Math.max(0, hours - stdHours);
      // Trực đêm không có ngày nghỉ bù → cộng thêm 8h vào quỹ giờ bù
      const nextDate = new Date(d.work_date); nextDate.setDate(nextDate.getDate() + 1);
      if (onCallNoBu.includes(nextDate.toISOString().slice(0,10))) {
        compHours += 8; // 1 ngày làm việc chuẩn = 8h bù
      }
    } else {
      totalWorkHours += hours;
      const stdHours = 8;
      overtimeHours += Math.max(0, hours - stdHours);
    }
  });

  // Tổng công = Ngày làm + Công trực + Nghỉ phép + Nghỉ lễ
  const totalWork = workDays + (onCall * 1.0) + paidLeave + holiday;

  // Phút muộn/về sớm
  const totalLateMinutes  = late.length  * 15; // ước tính 15p/lần
  const totalEarlyMinutes = early.length * 15;

  return {
    totalWork:        Math.round(totalWork * 100) / 100,
    workDays,                          // Ngày làm ca ngày
    onCall,                            // Công trực đêm
    actualWorkDays:   present.length,  // Tổng ngày có mặt
    absentDays:       absent.length,   // Ngày vắng
    totalLateMinutes,
    totalEarlyMinutes,
    holiday,                           // Nghỉ lễ
    paidLeave,                         // Nghỉ phép hưởng lương
    otherLeave,                        // Nghỉ khác
    compRest,                          // Nghỉ bù trực
    compHours:        Math.round(compHours * 100) / 100,      // Quỹ giờ bù tích lũy
    overtimeHours:    Math.round(overtimeHours * 100) / 100,  // Tăng ca
    totalAttendance:  details.filter(d => d.check_in_time).length,
    violationCount:   late.length + early.length,
    totalWorkHours:   Math.round(totalWorkHours * 100) / 100,
    nightShiftCount:  onCall,
    unpaidLeave:      0,
    socialInsuranceLeave: 0,
    compLeave:        compRest,
  };
}

async function getStaffList(query) {
  const { staffId, departmentId, roomId, search } = query;
  const page  = parseInt(query.page)  || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

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
    ORDER BY e.full_name LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  return { staff, total: parseInt(total) };
}

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

const workScheduleController = {

  // GET /work-schedule
  getAll: async (req, res) => {
    try {
      const { startDate, endDate, fromDate, toDate, month } = req.query;
      const filterFrom = startDate || fromDate || (month ? `${month}-01` : null);
      const filterTo   = endDate   || toDate   || (month ? getLastDay(month) : null);
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;

      const { staff, total } = await getStaffList(req.query);
      if (!staff.length) return res.json({
        statusCode:200, data:[], shiftTypesCount:{}, summary:{},
        pagination:{total:0,page,limit,totalPage:0}, metadata:null, message:'success'
      });

      const staffIds = staff.map(s => s.id);
      const { depts, rooms } = await getStaffDeptRooms(staffIds);

      let scheduleDetails = [];
      if (filterFrom && filterTo) {
        [scheduleDetails] = await db.query(`
          SELECT wsd.id, wsd.work_schedule_id, wsd.shift_template_id,
                 DATE_FORMAT(wsd.work_date, '%Y-%m-%d') as work_date,
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
            startTime: d.start_time || d.shift_start,
            endTime: d.end_time || d.shift_end,
            status: d.status,
            checkInTime: d.check_in_time || null,
            checkOutTime: d.check_out_time || null,
          });
        });
        const shiftTypesCount = { FIXED: 0, FLEXIBLE: 0, ON_CALL: 0, SPLIT: 0 };
        sdList.forEach(d => { if (shiftTypesCount[d.shift_type] !== undefined) shiftTypesCount[d.shift_type]++; });
        return {
          staff: {
            id: String(s.id), code: s.code, name: s.name, avatar: s.avatar, position: '',
            departments: depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
            rooms: rooms.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
            status: 'ACTIVE',
          },
          schedules: Object.values(byDate),
          shiftTypesCount,
        };
      });

      return res.json({
        statusCode: 200, data: gridData,
        shiftTypesCount: { FIXED: 0, FLEXIBLE: 0, ON_CALL: 0, SPLIT: 0 },
        summary: {},
        pagination: { total, page, limit, totalPage: Math.ceil(total/limit) },
        metadata: null, message: 'success',
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy danh sách phân ca', e); }
  },

  getCalendar: async (req, res) => workScheduleController.getAll(req, res),

  // POST /work-schedule
  create: async (req, res) => {
    try {
      const { staffId, departmentId, roomId, fromDate, toDate, note, details } = req.body;
      if (!staffId || !details?.length) return fail(res, 400, 'Thiếu thông tin phân ca');

      const [ws] = await db.query(
        `INSERT INTO hr_work_schedules (employee_id,department_id,room_id,from_date,to_date,note) VALUES (?,?,?,?,?,?)`,
        [staffId, departmentId||null, roomId||null, fromDate, toDate, note||null]
      );
      const wsId = ws.insertId;
      const dates = getDateRange(fromDate, toDate);

      for (const date of dates) {
        for (const d of details) {
          const { startTime, endTime } = await resolveShiftTimes(d.shiftTemplateId, d.startTime, d.endTime);
          // UPSERT - tránh duplicate
          const [[existing]] = await db.query(
            `SELECT id FROM hr_work_schedule_details WHERE work_schedule_id=? AND work_date=? AND shift_template_id=?`,
            [wsId, date, d.shiftTemplateId]
          );
          if (!existing) {
            const [wsd] = await db.query(
              `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time,note) VALUES (?,?,?,?,?,?,?)`,
              [wsId, staffId, d.shiftTemplateId, date, startTime, endTime, d.note||null]
            );
            await generateAttendance(staffId, wsd.insertId, date, d.shiftTemplateId, startTime);
          }
        }
      }
      ok(res, { id: String(wsId) }, 'Thêm phân ca thành công');
    } catch (e) { fail(res, 500, 'Lỗi tạo phân ca', e); }
  },

  // POST /work-schedule/range
  createRange: async (req, res) => workScheduleController.create(req, res),

  // GET /work-schedule/:id
  getById: async (req, res) => {
    try {
      const [[ws]] = await db.query(`
        SELECT ws.*, e.employee_code, e.full_name, e.avatar as staff_avatar
        FROM hr_work_schedules ws JOIN hr_employees e ON e.id=ws.employee_id
        WHERE ws.id=?`, [req.params.id]);
      if (!ws) return fail(res, 404, 'Không tìm thấy phân ca');

      const [[wsd]] = await db.query(`
        SELECT wsd.*, DATE_FORMAT(wsd.work_date,'%Y-%m-%d') as work_date,
               st.id as st_id, st.name as st_name, st.code as st_code,
               st.shift_type, st.start_time as st_start, st.end_time as st_end,
               st.coefficient, st.work_hours as st_hours, '#6576FF' as color
        FROM hr_work_schedule_details wsd
        JOIN shifts st ON st.id=wsd.shift_template_id
        WHERE wsd.work_schedule_id=? ORDER BY wsd.work_date LIMIT 1`, [req.params.id]);

      // Lấy dept/room từ hr_work_schedules (đúng với lúc tạo phân ca)
      const [[dept]] = await db.query(
        `SELECT id, name, code FROM cat_departments WHERE id=?`, [ws.department_id]
      );
      const [[room]] = ws.room_id
        ? await db.query(`SELECT id, name, code FROM cat_rooms WHERE id=?`, [ws.room_id])
        : [[null]];

      // Lấy tất cả dept/room của nhân viên cho dropdown
      const [allDepts] = await db.query(`
        SELECT d.id, d.name FROM hr_staff_departments rsd
        JOIN cat_departments d ON d.code=rsd.department_code
        WHERE rsd.employee_id=?
      `, [ws.employee_id]);
      const [allRooms] = await db.query(`
        SELECT r.id, r.name FROM hr_staff_rooms rsr
        JOIN cat_rooms r ON r.code=rsr.room_code
        WHERE rsr.employee_id=?
      `, [ws.employee_id]);

      ok(res, {
        id: String(ws.id), workDate: wsd?.work_date||null,
        startTime: wsd?.st_start||null, endTime: wsd?.st_end||null,
        status: wsd?.status||'SCHEDULED', note: wsd?.note || ws.note || '',
        createdAt: ws.created_at, updatedAt: ws.updated_at, deletedAt: null,

        shiftTemplate: wsd ? {
          id:String(wsd.st_id), code:wsd.st_code, name:wsd.st_name, type:wsd.shift_type,
          startTime:wsd.st_start, endTime:wsd.st_end,
          coefficient:wsd.coefficient||'1', standardHours:wsd.st_hours||'8',
          color:wsd.color||'#6576FF', status:'ACTIVE',
        } : null,
        department: dept ? {id:String(dept.id),code:dept.code,name:dept.name,status:'ACTIVE'} : null,
        room: room ? {id:String(room.id),code:room.code,name:room.name,status:'ACTIVE'} : null,
        // Trả đầy đủ để FE auto-fill dropdown
        // Merge dept/room của phân ca vào list nếu chưa có
        staff: {
          id: String(ws.employee_id), code: ws.employee_code, name: ws.full_name,
          avatar: ws.staff_avatar ? `http://localhost:5000/${ws.staff_avatar}` : null,
          departments: (() => {
            const list = allDepts.map(d => ({ id: String(d.id), name: d.name }));
            if (dept && !list.find(d => d.id === String(dept.id))) {
              list.unshift({ id: String(dept.id), name: dept.name });
            }
            return list;
          })(),
          rooms: (() => {
            const list = allRooms.map(r => ({ id: String(r.id), name: r.name }));
            if (room && !list.find(r => r.id === String(room.id))) {
              list.unshift({ id: String(room.id), name: room.name });
            }
            return list;
          })(),
        },
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết phân ca', e); }
  },

  // PATCH /work-schedule/:id
  update: async (req, res) => {
    try {
      const { roomId, departmentId, note, status, details } = req.body;
      const [[ws]] = await db.query(`SELECT employee_id,from_date,to_date FROM hr_work_schedules WHERE id=?`, [req.params.id]);
      if (!ws) return fail(res, 404, 'Không tìm thấy phân ca');

      await db.query(
        `UPDATE hr_work_schedules SET room_id=?,department_id=?,note=?,status=? WHERE id=?`,
        [roomId||null, departmentId||null, note||null, status||'SCHEDULED', req.params.id]
      );

      if (details?.length) {
        for (const d of details) {
          const { startTime, endTime } = await resolveShiftTimes(d.shiftTemplateId, d.startTime, d.endTime);
          const [[existing]] = await db.query(
            `SELECT id FROM hr_work_schedule_details WHERE work_schedule_id=? LIMIT 1`, [req.params.id]
          );
          if (existing) {
            await db.query(
              `UPDATE hr_work_schedule_details SET shift_template_id=?,start_time=?,end_time=?,note=? WHERE id=?`,
              [d.shiftTemplateId, startTime, endTime, d.note||null, existing.id]
            );
            await generateAttendance(ws.employee_id, existing.id, null, d.shiftTemplateId, startTime);
          } else {
            const dates = getDateRange(ws.from_date, ws.to_date);
            for (const date of dates) {
              const [wsd] = await db.query(
                `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time,note) VALUES (?,?,?,?,?,?,?)`,
                [req.params.id, ws.employee_id, d.shiftTemplateId, date, startTime, endTime, d.note||null]
              );
              await generateAttendance(ws.employee_id, wsd.insertId, date, d.shiftTemplateId, startTime);
            }
          }
        }
      }
      ok(res, null, 'Cập nhật phân ca thành công');
    } catch (e) { fail(res, 500, 'Lỗi cập nhật phân ca', e); }
  },

  // DELETE /work-schedule/:id
  delete: async (req, res) => {
    try {
      await db.query(`DELETE FROM hr_work_schedule_details WHERE work_schedule_id=?`, [req.params.id]);
      await db.query(`DELETE FROM hr_work_schedules WHERE id=?`, [req.params.id]);
      ok(res, null, 'Xóa phân ca thành công');
    } catch (e) { fail(res, 500, 'Lỗi xóa phân ca', e); }
  },

  // GET /work-schedule/attendance-table
  getAttendanceTable: async (req, res) => {
    try {
      const { month } = req.query;
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`, toDate = getLastDay(currentMonth);

      const { staff, total } = await getStaffList({ ...req.query, page, limit });
      if (!staff.length) return ok(res, []);
      const staffIds = staff.map(s => s.id);
      const { depts, rooms } = await getStaffDeptRooms(staffIds);

      let [details] = await db.query(`
        SELECT wsd.id, DATE_FORMAT(wsd.work_date,'%Y-%m-%d') as work_date,
               wsd.start_time, wsd.end_time, wsd.check_in_time, wsd.check_out_time,
               wsd.status, wsd.work_weight, ws.employee_id,
               st.name as shift_name, st.code as shift_code, st.shift_type,
               st.start_time as shift_start, st.end_time as shift_end, st.id as shift_template_id,
               ae.status as explanation_status
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        JOIN shifts st ON st.id=wsd.shift_template_id
        LEFT JOIN (
          SELECT employee_id, DATE_FORMAT(work_date,'%Y-%m-%d') as work_date,
                 MAX(CASE WHEN status='APPROVED' THEN 'APPROVED'
                          WHEN status='PENDING' THEN 'PENDING'
                          ELSE status END) as status
          FROM hr_attendance_explanations
          GROUP BY employee_id, DATE_FORMAT(work_date,'%Y-%m-%d')
        ) ae ON ae.employee_id=ws.employee_id 
               AND ae.work_date=DATE_FORMAT(wsd.work_date,'%Y-%m-%d')
        WHERE ws.employee_id IN (?) AND wsd.work_date BETWEEN ? AND ?
        ORDER BY wsd.work_date
      `, [staffIds, fromDate, toDate]);

      // Load explanations cho tất cả staff trong tháng
      const [explRows] = await db.query(`
        SELECT employee_id, DATE_FORMAT(work_date,'%Y-%m-%d') as work_date, status
        FROM hr_attendance_explanations
        WHERE employee_id IN (?) AND work_date BETWEEN ? AND ?
      `, [staffIds, fromDate, toDate]);

      // Map: { empId: { 'YYYY-MM-DD': 'APPROVED'|... } }
      const explMap = {};
      explRows.forEach(e => {
        if (!explMap[e.employee_id]) explMap[e.employee_id] = {};
        explMap[e.employee_id][e.work_date] = e.status;
      });

      const result = staff.map(s => {
        const sd = details.filter(d => d.employee_id === s.id);
        const empExpl = explMap[s.id] || {};
        const byShift = {};
        sd.forEach(d => {
          const key = d.shift_template_id;
          if (!byShift[key]) byShift[key] = {
            shift: {id:String(d.shift_template_id),code:d.shift_code,name:d.shift_name,startTime:d.shift_start,endTime:d.shift_end,breakTimes:[]},
            days: {}, summary: buildSummary([]),
          };
          byShift[key].days[d.work_date] = {
            workScheduleDetailId:String(d.id), date:d.work_date,
            // Nếu có giải trình APPROVED → hiện GT, ngược lại theo status
            displayCode: d.explanation_status === 'APPROVED' ? 'GT' : statusCode(d.status),
            shiftStartTime:d.shift_start, shiftEndTime:d.shift_end,
            checkInTime:d.check_in_time||null, checkOutTime:d.check_out_time||null,
            status:d.status, workWeight:parseFloat(d.work_weight)||1,
          };
        });
        Object.values(byShift).forEach(g => {
          g.summary = buildSummary(sd.filter(d=>d.shift_template_id===parseInt(g.shift.id)), empExpl);
        });
        return {
          staff: { id:String(s.id),code:s.code,name:s.name,avatar:s.avatar,status:'ACTIVE',
            departments:depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
            rooms:rooms.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
          },
          shifts: Object.values(byShift), summary: buildSummary(sd, empExpl),
        };
      });
      ok(res, result);
    } catch (e) { fail(res, 500, 'Lỗi lấy bảng chấm công', e); }
  },

  // GET /work-schedule/attendance-by-hours
  getAttendanceByHours: async (req, res) => {
    try {
      const { month } = req.query;
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = `${currentMonth}-01`, toDate = getLastDay(currentMonth);

      const { staff } = await getStaffList({ ...req.query, page, limit });
      if (!staff.length) return ok(res, []);
      const staffIds = staff.map(s => s.id);
      const { depts, rooms } = await getStaffDeptRooms(staffIds);

      let [details] = await db.query(`
        SELECT ws.employee_id, DATE_FORMAT(wsd.work_date,'%Y-%m-%d') as work_date,
               wsd.check_in_time, wsd.check_out_time, wsd.status
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        WHERE ws.employee_id IN (?) AND wsd.work_date BETWEEN ? AND ?
      `, [staffIds, fromDate, toDate]);

      const result = staff.map(s => {
        const sd = details.filter(d => d.employee_id === s.id);
        const days = {};
        sd.forEach(d => {
          // Tính giờ theo công thức - handle ca đêm qua ngày
          let hours = 0;
          if (d.check_in_time && d.check_out_time) {
            const inMs  = new Date(d.check_in_time).getTime();
            const outMs = new Date(d.check_out_time).getTime();
            let diff = (outMs - inMs) / 3600000;
            if (diff < 0) diff += 24; // ca đêm qua ngày
            hours = Math.round(diff * 100) / 100;
          }
          if (!days[d.work_date]) days[d.work_date] = { date:d.work_date, dayOfWeek:new Date(d.work_date).getDay(), hours:0, status:d.status };
          days[d.work_date].hours += hours; // cộng dồn nhiều ca/ngày
        });
        return {
          staffId:String(s.id), staffCode:s.code, staffName:s.name, position:'',
          departments:depts.filter(d=>d.employee_id===s.id).map(d=>({id:String(d.id),name:d.name})),
          rooms:rooms.filter(r=>r.employee_id===s.id).map(r=>({id:String(r.id),name:r.name})),
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
        SELECT wsd.id, DATE_FORMAT(wsd.work_date,'%Y-%m-%d') as work_date,
               wsd.start_time, wsd.end_time, wsd.status, wsd.note,
               wsd.check_in_time, wsd.check_out_time, wsd.work_weight,
               ws.employee_id, ws.department_id, ws.room_id,
               e.employee_code as staff_code, e.full_name as staff_name, e.avatar,
               st.id as shift_id, st.name as shift_name, st.code as shift_code,
               st.shift_type, st.start_time as shift_start, st.end_time as shift_end,
               st.coefficient,
               dep.name as department_name, r.name as room_name
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        JOIN hr_employees e ON e.id=ws.employee_id
        JOIN shifts st ON st.id=wsd.shift_template_id
        LEFT JOIN cat_departments dep ON dep.id=ws.department_id
        LEFT JOIN cat_rooms r ON r.id=ws.room_id
        WHERE wsd.id=?`, [req.params.id]);
      if (!d) return fail(res, 404, 'Không tìm thấy chi tiết chấm công');

      // Map sang format FE expect
      ok(res, {
        id: String(d.id),
        workDate: d.work_date,
        startTime: d.shift_start || d.start_time,
        endTime: d.shift_end || d.end_time,
        status: d.status,
        displayCode: d.status,
        note: d.note || '',
        noteStartTime: null,
        noteEndTime: null,
        totalWorkHours: (() => {
          if (!d.check_in_time || !d.check_out_time) return 0;
          const diff = (new Date(d.check_out_time) - new Date(d.check_in_time)) / 3600000;
          return Math.round((diff < 0 ? diff + 24 : diff) * 100) / 100;
        })(),
        totalCompHours: 0,
        departmentName: d.department_name || '',
        roomName: d.room_name || '',
        departments: d.department_name ? [{ id: String(d.department_id||''), name: d.department_name }] : [],
        rooms: d.room_name ? [{ id: String(d.room_id||''), name: d.room_name }] : [],
        histories: [],
        breaktime: [],
        staff: {
          id: String(d.employee_id),
          code: d.staff_code,
          name: d.staff_name,
          avatar: d.avatar ? `http://localhost:5000/${d.avatar}` : null,
        },
        shift: {
          id: String(d.shift_id),
          code: d.shift_code,
          name: d.shift_name,
          color: '#6576FF',
          type: d.shift_type,
          startTime: d.shift_start,
          endTime: d.shift_end,
        },
        attendance: {
          // Format HH:mm (+7) để FE dùng với dayjs(val, 'HH:mm')
          checkInTime: d.check_in_time ? (() => {
            const d2 = new Date(d.check_in_time);
            const h = String((d2.getUTCHours() + 7) % 24).padStart(2,'0');
            const m = String(d2.getUTCMinutes()).padStart(2,'0');
            return `${h}:${m}`;
          })() : null,
          checkOutTime: d.check_out_time ? (() => {
            const d2 = new Date(d.check_out_time);
            const h = String((d2.getUTCHours() + 7) % 24).padStart(2,'0');
            const m = String(d2.getUTCMinutes()).padStart(2,'0');
            return `${h}:${m}`;
          })() : null,
          checkInImage: null,
          checkOutImage: null,
          checkInLocation: null,
          checkOutLocation: null,
          checkInMethod: 'MANUAL',
          checkOutMethod: 'MANUAL',
        },
      });
    } catch (e) { fail(res, 500, 'Lỗi lấy chi tiết chấm công', e); }
  },

  // PATCH /work-schedule/detail/:id/attendance
  updateAttendance: async (req, res) => {
    try {
      const { checkInTime, checkOutTime, actualCheckIn, actualCheckOut, status, note, reason } = req.body;
      const id = req.params.id;

      // Lấy work_date từ DB
      const [[wsd]] = await db.query(
        `SELECT DATE_FORMAT(work_date,'%Y-%m-%d') as work_date FROM hr_work_schedule_details WHERE id=?`, [id]
      );
      if (!wsd) return fail(res, 404, 'Không tìm thấy bản ghi chấm công');
      const workDate = wsd.work_date;

      let ci = actualCheckIn || checkInTime || null;
      let co = actualCheckOut || checkOutTime || null;

      // Ghép HH:mm với work_date
      const isHHmm = (s) => s && /^\d{2}:\d{2}$/.test(s);
      if (isHHmm(ci)) ci = `${workDate} ${ci}:00`;
      if (isHHmm(co)) {
        const ciHour = ci ? parseInt(ci.split(' ')[1]) : 0;
        const coHour = parseInt(co.split(':')[0]);
        if (coHour < ciHour) {
          const next = new Date(workDate); next.setDate(next.getDate() + 1);
          co = `${next.toISOString().slice(0,10)} ${co}:00`;
        } else {
          co = `${workDate} ${co}:00`;
        }
      }

      await db.query(
        `UPDATE hr_work_schedule_details SET check_in_time=?,check_out_time=?,status=?,note=? WHERE id=?`,
        [ci||null, co||null, status||'PRESENT', note||reason||null, id]
      );
      ok(res, null, 'Cập nhật chấm công thành công');
    } catch (e) { fail(res, 500, 'Lỗi cập nhật chấm công', e); }
  },

  // GET /work-schedule/staff-daily-attendance
  getStaffDailyAttendance: async (req, res) => {
    try {
      const { staffId, fromDate: fd, toDate: td, month } = req.query;
      if (!staffId) return fail(res, 400, 'Thiếu staffId');
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const fromDate = fd || `${currentMonth}-01`;
      const toDate   = td || getLastDay(currentMonth);

      const [[emp]] = await db.query(
        `SELECT e.id, e.employee_code, e.full_name, e.avatar,
                COALESCE(c.level_name, 'DOCTOR') as position,
                dep.name as department_name
         FROM hr_employees e
         LEFT JOIN hr_contracts c ON c.employee_id=e.id AND c.status='ACTIVE'
         LEFT JOIN hr_staff_departments rsd ON rsd.employee_id=e.id
         LEFT JOIN cat_departments dep ON dep.code=rsd.department_code
         WHERE e.id=? LIMIT 1`, [staffId]);

      const [details] = await db.query(`
        SELECT wsd.id, DATE_FORMAT(wsd.work_date,'%Y-%m-%d') as work_date,
               wsd.check_in_time, wsd.check_out_time, wsd.status, wsd.note,
               st.name as shift_name, st.code as shift_code, st.shift_type,
               st.start_time as shift_start, st.end_time as shift_end
        FROM hr_work_schedule_details wsd
        JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
        JOIN shifts st ON st.id=wsd.shift_template_id
        WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
        ORDER BY wsd.work_date, wsd.check_in_time
      `, [staffId, fromDate, toDate]);

      const DOW = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];

      // Group by date
      const byDate = {};
      details.forEach(d => {
        if (!byDate[d.work_date]) byDate[d.work_date] = { date: d.work_date, dayOfWeek: DOW[new Date(d.work_date).getDay()], entries: [] };
        byDate[d.work_date].entries.push(d);
      });

      // Build days array
      const days = Object.values(byDate).map(day => {
        const entry = day.entries[0];
        const ci = entry?.check_in_time;
        const co = entry?.check_out_time;
        let totalHours = 0;
        if (ci && co) {
          const diff = (new Date(co) - new Date(ci)) / 3600000;
          totalHours = Math.round((diff < 0 ? diff + 24 : diff) * 100) / 100;
        }
        // Ghép các ca trong ngày
        const shiftCodes = day.entries.map(e => e.shift_code).filter(Boolean).join(', ');
        const ciStr = ci ? (() => { const d2=new Date(ci); return `${String((d2.getUTCHours()+7)%24).padStart(2,'0')}:${String(d2.getUTCMinutes()).padStart(2,'0')}`; })() : null;
        const coStr = co ? (() => { const d2=new Date(co); return `${String((d2.getUTCHours()+7)%24).padStart(2,'0')}:${String(d2.getUTCMinutes()).padStart(2,'0')}`; })() : null;

        return {
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          checkInTime: ciStr,
          checkOutTime: coStr,
          totalHoursDisplay: totalHours ? `${Math.floor(totalHours)}h${Math.round((totalHours%1)*60)}m` : '--',
          totalHours,
          lateMinutes: entry?.status === 'LATE' ? 15 : 0,
          earlyMinutes: 0,
          explanationStatus: 'NONE',
          isLeave: ['LEAVE','LEAVE_PAID'].includes(entry?.status),
          shiftCode: shiftCodes || null,
          timeline: [],
          allowedLateMinutes: 15,
          allowedEarlyLeaveMinutes: 15,
          displayCode: entry?.status === 'PRESENT' ? 'P' : entry?.status === 'ABSENT' ? 'AB' : entry?.status === 'LATE' ? 'L' : 'N',
        };
      });

      // Summary
      const lateCount    = details.filter(d => d.status === 'LATE').length;
      const absentCount  = details.filter(d => d.status === 'ABSENT').length;
      const summary = {
        dayOff: absentCount,
        lateCount,
        earlyLeaveCount: 0,
        missedCheckIn: details.filter(d => !d.check_in_time && d.status !== 'ABSENT').length,
        remainingLeave: 12,
        unauthorizedLeave: absentCount,
      };

      ok(res, [{
        staffId: String(emp?.id || staffId),
        staffCode: emp?.employee_code || '',
        staffName: emp?.full_name || '',
        position: emp?.position || 'DOCTOR',
        departmentName: emp?.department_name || '',
        summary,
        days,
      }]);
    } catch (e) { fail(res, 500, 'Lỗi lấy chấm công nhân viên', e); }
  },
};

// ─── Helpers ─────────────────────────────────────────────────
async function resolveShiftTimes(shiftTemplateId, startTime, endTime) {
  let st = startTime || null, et = endTime || null;
  if (!st || !et) {
    const [[sh]] = await db.query(`SELECT start_time, end_time FROM shifts WHERE id=?`, [shiftTemplateId]);
    if (sh) { st = st || sh.start_time; et = et || sh.end_time; }
  }
  return { startTime: st || '00:00:00', endTime: et || '00:00:00' };
}

// Mock Attendance Generator — tự sinh chấm công theo ca
async function generateAttendance(employeeId, wsdId, date, shiftTemplateId, startTime) {
  try {
    if (!date) {
      const [[wsd]] = await db.query(`SELECT DATE_FORMAT(work_date,'%Y-%m-%d') as work_date FROM hr_work_schedule_details WHERE id=?`, [wsdId]);
      date = wsd?.work_date;
    }
    if (!date) return;

    const [[shift]] = await db.query(`SELECT code, shift_type, start_time, end_time FROM shifts WHERE id=?`, [shiftTemplateId]);
    if (!shift) return;

    const code = (shift.code || '').toUpperCase();
    const st   = shift.start_time || startTime || '07:00:00';
    let checkIn, checkOut;

    // Giờ theo SRS: HC=07:55-17:05, S=05:55-14:05, C=13:55-22:05, Đ=21:55-06:05
    if (code.includes('HC') || st.startsWith('07') || st.startsWith('08')) {
      checkIn = `${date} 07:55:00`; checkOut = `${date} 17:05:00`;
    } else if (code === 'S' || st.startsWith('05') || st.startsWith('06')) {
      checkIn = `${date} 05:55:00`; checkOut = `${date} 14:05:00`;
    } else if (code === 'C' || st.startsWith('13') || st.startsWith('14')) {
      checkIn = `${date} 13:55:00`; checkOut = `${date} 22:05:00`;
    } else if (code === 'D' || code === 'Đ' || st.startsWith('21') || st.startsWith('22')) {
      const next = new Date(date); next.setDate(next.getDate() + 1);
      checkIn = `${date} 21:55:00`; checkOut = `${next.toISOString().slice(0,10)} 06:05:00`;
    } else {
      checkIn = `${date} ${st.slice(0,8)}`; checkOut = `${date} 17:00:00`;
    }

    // Tính giờ thực tế theo công thức SRS
    const inMs  = new Date(checkIn).getTime();
    const outMs = new Date(checkOut).getTime();
    let actualHours = (outMs - inMs) / 3600000;
    if (actualHours < 0) actualHours += 24;
    const standardHours = 8;
    const overtimeHours = Math.max(0, actualHours - standardHours);

    await db.query(`
      UPDATE hr_work_schedule_details
      SET check_in_time=?, check_out_time=?, status='PRESENT',
          work_weight=1.00
      WHERE id=?
    `, [checkIn, checkOut, wsdId]);
  } catch (e) {
    console.error('[generateAttendance]', e.message);
  }
}

module.exports = workScheduleController;