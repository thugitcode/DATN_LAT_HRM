const db = require('../config/db');

const ok   = (res, data, msg='success') => res.json({ statusCode:200, data, message:msg });
const fail = (res, status, msg, err=null) => {
  if (err) console.error(`[detailed-time-sheet] ${msg}:`, err.message);
  return res.status(status).json({ statusCode:status, message:msg });
};

module.exports = {
  getDetailedAttendanceTable: async (req, res) => {
    try {
      const { fromDate, toDate, search, departmentId, roomId, page=1, limit=20, getAll } = req.query;

      const fd = fromDate || new Date().toISOString().slice(0,7) + '-01';
      const [y, m] = fd.split('-').map(Number);
      const td = toDate || new Date(y, m, 0).toISOString().slice(0,10);

      // Filter nhân viên
      let where = ["e.status != 'RESIGNED'"];
      let params = [];
      if (search)       { where.push('(e.full_name LIKE ? OR e.employee_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
      if (departmentId) { where.push('EXISTS(SELECT 1 FROM hr_staff_departments sd JOIN cat_departments cd ON cd.code=sd.department_code WHERE sd.employee_id=e.id AND cd.id=?)'); params.push(departmentId); }
      if (roomId)       { where.push('EXISTS(SELECT 1 FROM hr_staff_rooms sr JOIN cat_rooms cr ON cr.code=sr.room_code WHERE sr.employee_id=e.id AND cr.id=?)'); params.push(roomId); }

      const [[{total}]] = await db.query(
        `SELECT COUNT(DISTINCT e.id) as total FROM hr_employees e WHERE ${where.join(' AND ')}`, params);

      let staffQuery = `
        SELECT e.id, e.employee_code as code, e.full_name as name, e.avatar,
               COALESCE(jt.name,'Nhân viên') as position,
               (SELECT d.id FROM hr_staff_departments sd JOIN cat_departments d ON d.code=sd.department_code WHERE sd.employee_id=e.id LIMIT 1) as dept_id,
               (SELECT d.name FROM hr_staff_departments sd JOIN cat_departments d ON d.code=sd.department_code WHERE sd.employee_id=e.id LIMIT 1) as dept_name,
               (SELECT r.id FROM hr_staff_rooms sr JOIN cat_rooms r ON r.code=sr.room_code WHERE sr.employee_id=e.id LIMIT 1) as room_id,
               (SELECT r.name FROM hr_staff_rooms sr JOIN cat_rooms r ON r.code=sr.room_code WHERE sr.employee_id=e.id LIMIT 1) as room_name
        FROM hr_employees e
        LEFT JOIN hr_contracts c ON c.employee_id=e.id AND c.status='ACTIVE'
        LEFT JOIN cat_titles jt ON jt.id=c.job_title_code
        WHERE ${where.join(' AND ')}
        ORDER BY e.full_name`;

      if (!getAll) staffQuery += ` LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page)-1)*parseInt(limit)}`;

      const [staffList] = await db.query(staffQuery, params);

      const result = await Promise.all(staffList.map(async s => {
        const [wsdRows] = await db.query(`
          SELECT wsd.id,
                 DATE_FORMAT(wsd.work_date,'%Y-%m-%d') as date,
                 wsd.status, wsd.check_in_time, wsd.check_out_time, wsd.work_weight,
                 st.code as shift_code,
                 st.start_time as shift_start,
                 st.end_time   as shift_end,
                 st.shift_type
          FROM hr_work_schedule_details wsd
          JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
          JOIN shifts st ON st.id=wsd.shift_template_id
          WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
          ORDER BY wsd.work_date
        `, [s.id, fd, td]);

        const days = wsdRows.map(r => {
          // check_in_time từ MySQL trả về Date object
          const ciMs = r.check_in_time  ? (r.check_in_time instanceof Date  ? r.check_in_time.getTime()  : new Date(r.check_in_time).getTime())  : null;
          const coMs = r.check_out_time ? (r.check_out_time instanceof Date ? r.check_out_time.getTime() : new Date(r.check_out_time).getTime()) : null;

          // Tính muộn/sớm (chỉ khi có giờ ca)
          let lateMinutes = 0, earlyMinutes = 0;
          if (ciMs && r.shift_start && typeof r.shift_start === 'string') {
            const [sh, sm] = r.shift_start.split(':').map(Number);
            if (!isNaN(sh)) {
              // shift_start là giờ VN (UTC+7)
              const dayStart = ciMs - (ciMs % 86400000);
              const shiftStartMs = dayStart + (sh * 3600 + sm * 60) * 1000 - 7 * 3600000;
              lateMinutes = Math.max(0, Math.round((ciMs - shiftStartMs) / 60000));
              if (lateMinutes < 5) lateMinutes = 0;
            }
          }
          if (coMs && r.shift_end && typeof r.shift_end === 'string') {
            const [eh, em] = r.shift_end.split(':').map(Number);
            if (!isNaN(eh)) {
              const dayStart = coMs - (coMs % 86400000);
              const shiftEndMs = dayStart + (eh * 3600 + em * 60) * 1000 - 7 * 3600000;
              earlyMinutes = Math.max(0, Math.round((shiftEndMs - coMs) / 60000));
              if (earlyMinutes < 5) earlyMinutes = 0;
            }
          }

          // Tính giờ làm thực tế
          let totalWorkHours = 0, overtimeHours = 0;
          if (ciMs && coMs) {
            let diffMs = coMs - ciMs;
            if (diffMs < 0) diffMs += 24 * 3600000;
            totalWorkHours = Math.round(diffMs / 3600000 * 100) / 100;
            const std = r.shift_type === 'ON_CALL' ? 9 : 8;
            overtimeHours = Math.max(0, Math.round((totalWorkHours - std) * 100) / 100);
          }
          const compHours = r.status === 'COMPENSATORY_LEAVE' ? 8 : 0;

          const standardTime = r.shift_start && r.shift_end
            ? `${r.shift_start.slice(0,5)} - ${r.shift_end.slice(0,5)}`
            : r.shift_type === 'ON_CALL' ? 'Ca trực đêm' : '--';

          const workCount = ['PRESENT','LATE','EARLY_LEAVE','HOLIDAY','COMPENSATORY_LEAVE','LEAVE_PAID'].includes(r.status) ? 1 : 0;

          return {
            date: r.date,
            shiftCode: r.shift_code || '--',
            standardTime,
            checkInTime:  ciMs ? new Date(ciMs).toISOString() : null,
            checkOutTime: coMs ? new Date(coMs).toISOString() : null,
            status: r.status,
            lateMinutes,
            earlyMinutes,
            workCount,
            totalWorkHours,
            overtimeHours,
            compHours,
          };
        });

        return {
          staff: {
            id: String(s.id),
            code: s.code,
            name: s.name,
            avatar: s.avatar,
            position: s.position || 'Nhân viên',
            department: s.dept_name || '',
            room: s.room_name || '',
            departments: s.dept_name ? [{ id: String(s.dept_id||''), name: s.dept_name }] : [],
            rooms: s.room_name ? [{ id: String(s.room_id||''), name: s.room_name }] : [],
          },
          days,
        };
      }));

      const totalInt = parseInt(total);
      const pageInt  = parseInt(page);
      const limitInt = parseInt(limit);
      const totalPages = Math.ceil(totalInt / limitInt);

      res.json({
        statusCode: 200,
        // FE dùng page.data trực tiếp → phải là array
        data: result,
        pagination: {
          total: totalInt,
          page: pageInt,
          limit: limitInt,
          totalPage: totalPages,
          hasNextPage: pageInt < totalPages,
          page: pageInt,
          nextPage: pageInt < totalPages ? pageInt + 1 : null,
        },
        metadata: {
          fromDate: fd,
          toDate: td,
        },
        message: 'success',
      });
    } catch(e) { fail(res, 500, 'Lỗi lấy bảng công chi tiết', e); }
  },
};