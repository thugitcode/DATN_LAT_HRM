// Seed script - chạy: node seed.js [month]
// Logic: "Lịch đâu công đó" - chấm công ăn theo phân ca
require('dotenv').config();
const db = require('./config/db');

const month = process.argv[2] || new Date().toISOString().slice(0, 7);

function getLastDay(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).toISOString().slice(0, 10);
}
function getDateRange(from, to) {
  const dates = [], cur = new Date(from), end = new Date(to);
  while (cur <= end) { dates.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
  return dates;
}

async function getEmpDeptRoom(empId) {
  const [[dept]] = await db.query(`
    SELECT d.id FROM hr_staff_departments rsd
    JOIN cat_departments d ON d.code=rsd.department_code
    WHERE rsd.employee_id=? LIMIT 1`, [empId]);
  const [[room]] = await db.query(`
    SELECT r.id FROM hr_staff_rooms rsr
    JOIN cat_rooms r ON r.code=rsr.room_code
    WHERE rsr.employee_id=? LIMIT 1`, [empId]);
  return { deptId: dept?.id || null, roomId: room?.id || null };
}

// Bước 2: Sinh giờ chấm công từ ca — "Lịch đâu công đó"
function calcAttendance(date, shiftCode, startTime, endTime) {
  const code = (shiftCode || '').toUpperCase();
  const st   = startTime || '07:00:00';
  const et   = endTime   || '17:00:00';

  let checkIn, checkOut;

  if (code.includes('HC') || st.startsWith('07') || st.startsWith('08')) {
    checkIn  = `${date} 07:55:00`;
    checkOut = `${date} 17:05:00`;
  } else if (code === 'S' || st.startsWith('05') || st.startsWith('06')) {
    checkIn  = `${date} 05:55:00`;
    checkOut = `${date} 14:05:00`;
  } else if (code === 'C' || st.startsWith('13') || st.startsWith('14')) {
    checkIn  = `${date} 13:55:00`;
    checkOut = `${date} 22:05:00`;
  } else if (code === 'D' || code.includes('Đ') || st.startsWith('21') || st.startsWith('22')) {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    checkIn  = `${date} 21:55:00`;
    checkOut = `${next.toISOString().slice(0,10)} 06:05:00`;
  } else {
    // Ca linh hoạt: dùng đúng giờ từ DB
    const [sh, sm] = st.split(':').map(Number);
    const [eh, em] = et.split(':').map(Number);
    let outDate = date;
    if (eh < sh) { // qua ngày
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      outDate = next.toISOString().slice(0, 10);
    }
    checkIn  = `${date} ${st.slice(0, 8)}`;
    checkOut = `${outDate} ${et.slice(0, 8)}`;
  }

  // Random 5% vắng, 7% muộn — có thể tắt nếu muốn toàn PRESENT
  const rand = Math.random();
  if (rand < 0.05) {
    return { checkIn: null, checkOut: null, status: 'ABSENT' };
  } else if (rand < 0.12) {
    const late = Math.floor(Math.random() * 30) + 15;
    const d = new Date(checkIn);
    d.setMinutes(d.getMinutes() + late);
    const lateIn = d.toISOString().slice(0,10) + ' ' + d.toTimeString().slice(0,8);
    return { checkIn: lateIn, checkOut, status: 'LATE' };
  }
  return { checkIn, checkOut, status: 'PRESENT' };
}

function getShiftPattern(empIndex, dayIndex, dow, shifts) {
  const fixed  = shifts.filter(s => s.shift_type === 'FIXED');
  const flex   = shifts.filter(s => s.shift_type === 'FLEXIBLE');
  const onCall = shifts.filter(s => s.shift_type === 'ON_CALL');
  const all    = shifts;

  const doDouble = dow === 6 ? Math.random() < 0.3 : Math.random() < 0.15;

  const patterns = [
    (di) => [fixed[di % Math.max(fixed.length,1)] || all[0]],
    (di) => [fixed[1 % Math.max(fixed.length,1)] || all[1 % all.length]],
    (di) => di % 3 === 0
      ? [all.find(s => s.code?.toUpperCase().includes('Đ') || s.start_time?.startsWith('21')) || all[di % all.length]]
      : [all[di % all.length]],
    (di) => [all[di % all.length]],
    (di) => di % 2 === 0 && flex.length ? [flex[di % flex.length]] : [all[di % all.length]],
    (di) => [all[di % all.length]],
  ];

  const main = (patterns[Math.min(empIndex, patterns.length-1)](dayIndex) || [all[0]]).filter(Boolean);

  if (doDouble && main[0]) {
    let second = null;
    if (main[0].shift_type === 'FIXED')   second = onCall[dayIndex % Math.max(onCall.length,1)] || null;
    if (main[0].shift_type === 'ON_CALL') second = fixed[dayIndex % Math.max(fixed.length,1)] || null;
    if (main[0].shift_type === 'FLEXIBLE')second = onCall[dayIndex % Math.max(onCall.length,1)] || null;
    if (second && second.id !== main[0].id) return [...main, second];
  }
  return main;
}

async function seed() {
  console.log(`\n🌱 Seeding tháng ${month} — "Lịch đâu công đó"\n`);
  const fromDate = `${month}-01`;
  const toDate   = getLastDay(month);
  const workDates = getDateRange(fromDate, toDate).filter(d => new Date(d).getDay() !== 0);

  const [employees] = await db.query(
    `SELECT id, full_name FROM hr_employees WHERE status != 'RESIGNED' LIMIT 12`);
  const [shifts] = await db.query(
    `SELECT id, code, shift_type, start_time, end_time FROM shifts ORDER BY id`);

  if (!shifts.length) { console.log('❌ Chưa có ca!'); process.exit(1); }
  console.log(`👤 ${employees.length} nhân viên | 📅 ${workDates.length} ngày | 🕐 ${shifts.length} ca\n`);

  let totalWs = 0, totalWsd = 0;

  for (let ei = 0; ei < employees.length; ei++) {
    const emp = employees[ei];

    // Xóa phân ca cũ trong tháng
    const [oldWs] = await db.query(
      `SELECT id FROM hr_work_schedules WHERE employee_id=? AND from_date >= ? AND to_date <= ?`,
      [emp.id, fromDate, toDate]);
    for (const ws of oldWs) {
      await db.query(`DELETE FROM hr_work_schedule_details WHERE work_schedule_id=?`, [ws.id]);
      await db.query(`DELETE FROM hr_work_schedules WHERE id=?`, [ws.id]);
    }

    const { deptId, roomId } = await getEmpDeptRoom(emp.id);
    let empWs = 0, empWsd = 0;

    for (let di = 0; di < workDates.length; di++) {
      const date      = workDates[di];
      const dow       = new Date(date).getDay();
      const shiftList = getShiftPattern(ei, di, dow, shifts).filter(Boolean);

      for (const shift of shiftList) {
        // BƯỚC 1: Tạo lịch phân ca
        const [ws] = await db.query(
          `INSERT INTO hr_work_schedules (employee_id,department_id,room_id,from_date,to_date,note)
           VALUES (?,?,?,?,?,?)`,
          [emp.id, deptId, roomId, date, date, `Seed ${month}`]);
        empWs++;

        const [wsd] = await db.query(
          `INSERT INTO hr_work_schedule_details
           (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time)
           VALUES (?,?,?,?,?,?)`,
          [ws.insertId, emp.id, shift.id, date, shift.start_time||'07:00:00', shift.end_time||'17:00:00']);
        empWsd++;

        // BƯỚC 2+3: Sinh chấm công ĂN THEO lịch — đúng khung giờ ca đã phân
        const { checkIn, checkOut, status } = calcAttendance(
          date, shift.code, shift.start_time, shift.end_time
        );

        await db.query(
          `UPDATE hr_work_schedule_details
           SET check_in_time=?, check_out_time=?, status=?
           WHERE id=?`,
          [checkIn, checkOut, status, wsd.insertId]);
      }
    }

    totalWs  += empWs;
    totalWsd += empWsd;
    console.log(`  ✅ ${emp.full_name.padEnd(22)} ${empWsd} ca  (khoa:${deptId||'-'} phòng:${roomId||'-'})`);
  }

  console.log(`\n✨ Tổng: ${totalWs} phân ca, ${totalWsd} bản ghi chấm công\n`);

  // Seed đơn giải trình cho ngày ABSENT
  const [absents] = await db.query(`
    SELECT wsd.id, ws.employee_id, DATE_FORMAT(wsd.work_date,'%Y-%m-%d') as work_date
    FROM hr_work_schedule_details wsd
    JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
    WHERE wsd.status='ABSENT' AND wsd.work_date BETWEEN ? AND ?
    LIMIT 5`, [fromDate, toDate]);

  for (const row of absents) {
    await db.query(
      `INSERT INTO hr_attendance_explanations
       (employee_id,work_date,type,reason,status,created_at)
       VALUES (?,?,'MISSING_CHECK_IN','Quên quẹt thẻ do bận cấp cứu','PENDING',NOW())`,
      [row.employee_id, row.work_date]).catch(() => {});
  }
  if (absents.length) console.log(`📋 Tạo ${absents.length} đơn giải trình mẫu PENDING\n`);

  process.exit(0);
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });