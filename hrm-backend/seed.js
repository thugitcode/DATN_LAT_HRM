// Seed script - chạy: node seed.js [month]
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

async function getShifts() {
  const [rows] = await db.query(`SELECT id, code, shift_type, start_time, end_time FROM shifts ORDER BY id`);
  return rows;
}

async function generateAttendance(empId, wsdId, date, shiftCode, startTime) {
  const code = (shiftCode || '').toUpperCase();
  const st = startTime || '07:00:00';
  let checkIn, checkOut;
  if (code.includes('HC') || st.startsWith('07') || st.startsWith('08')) {
    checkIn = `${date} 07:55:00`; checkOut = `${date} 17:05:00`;
  } else if (code === 'S' || st.startsWith('05') || st.startsWith('06')) {
    checkIn = `${date} 05:55:00`; checkOut = `${date} 14:05:00`;
  } else if (code === 'C' || st.startsWith('13') || st.startsWith('14')) {
    checkIn = `${date} 13:55:00`; checkOut = `${date} 22:05:00`;
  } else if (code === 'D' || code.includes('Đ') || st.startsWith('21') || st.startsWith('22')) {
    const next = new Date(date); next.setDate(next.getDate() + 1);
    checkIn = `${date} 21:55:00`; checkOut = `${next.toISOString().slice(0,10)} 06:05:00`;
  } else {
    // Ca linh hoạt: giờ từ DB + 8 tiếng
    const [h, m2] = st.split(':').map(Number);
    const outH = (h + 8) % 24;
    const outDate = h + 8 >= 24 ? (() => { const d2=new Date(date); d2.setDate(d2.getDate()+1); return d2.toISOString().slice(0,10); })() : date;
    checkIn = `${date} ${st.slice(0,8)}`; 
    checkOut = `${outDate} ${String(outH).padStart(2,'0')}:${String(m2).padStart(2,'0')}:00`;
  }
  // 10% vắng mặt, 10% đi muộn
  const rand = Math.random();
  let status = 'PRESENT';
  if (rand < 0.05) { status = 'ABSENT'; checkIn = null; checkOut = null; }
  else if (rand < 0.12) {
    status = 'LATE';
    // Đến muộn 15-45 phút
    const late = Math.floor(Math.random() * 30) + 15;
    const d = new Date(checkIn);
    d.setMinutes(d.getMinutes() + late);
    checkIn = d.toISOString().slice(0,10) + ' ' + d.toTimeString().slice(0,8);
  }
  await db.query(
    `UPDATE hr_work_schedule_details SET check_in_time=?,check_out_time=?,status=? WHERE id=?`,
    [checkIn, checkOut, status, wsdId]
  );
}

// Lịch phân ca theo pattern cho từng nhân viên
function getShiftPattern(empIndex, dayIndex, dow, shifts) {
  const fixedShifts = shifts.filter(s => s.shift_type === 'FIXED');
  const flexShifts  = shifts.filter(s => s.shift_type !== 'FIXED');
  const allShifts   = shifts;

  // Pattern xoay vòng theo nhân viên
  const patterns = [
    // NV 0: Ca HC tuần 1-2, ca S tuần 3-4
    (di) => [fixedShifts[di % fixedShifts.length] || allShifts[0]],
    // NV 1: Ca chiều cố định
    (di) => [fixedShifts[1 % fixedShifts.length] || allShifts[1 % allShifts.length]],
    // NV 2: Xen kẽ ca sáng + ca đêm (trực đêm)
    (di) => di % 3 === 0 
      ? [allShifts.find(s => s.code?.toUpperCase().includes('Đ') || s.start_time?.startsWith('21')) || allShifts[di % allShifts.length]]
      : [allShifts[di % allShifts.length]],
    // NV 3: 2 ca/ngày vào cuối tuần (T7)
    (di) => dow === 6 && fixedShifts.length >= 2
      ? [fixedShifts[0], fixedShifts[1]]
      : [allShifts[di % allShifts.length]],
    // NV 4: Ca linh hoạt xen kẽ
    (di) => di % 2 === 0 && flexShifts.length
      ? [flexShifts[di % flexShifts.length]]
      : [allShifts[di % allShifts.length]],
    // NV 5+: xoay vòng tất cả
    (di) => [allShifts[di % allShifts.length]],
  ];

  const patternFn = patterns[Math.min(empIndex, patterns.length - 1)];
  return patternFn(dayIndex).filter(Boolean);
}

async function seed() {
  console.log(`\n🌱 Seeding phân ca cho tháng ${month}...\n`);
  const fromDate = `${month}-01`;
  const toDate   = getLastDay(month);
  const allDates = getDateRange(fromDate, toDate);
  const workDates = allDates.filter(d => new Date(d).getDay() !== 0); // bỏ CN

  const [employees] = await db.query(`SELECT id, full_name FROM hr_employees WHERE status != 'RESIGNED' LIMIT 12`);
  const shifts = await getShifts();

  if (!shifts.length) { console.log('❌ Chưa có ca làm việc nào!'); process.exit(1); }

  console.log(`👤 ${employees.length} nhân viên | 📅 ${workDates.length} ngày | 🕐 ${shifts.length} loại ca\n`);
  console.log('Ca hiện có:', shifts.map(s => `${s.code}(${s.shift_type})`).join(', '), '\n');

  let totalCount = 0;

  for (let ei = 0; ei < employees.length; ei++) {
    const emp = employees[ei];

    // Xóa phân ca cũ trong tháng
    const [oldWs] = await db.query(
      `SELECT id FROM hr_work_schedules WHERE employee_id=? AND from_date >= ? AND to_date <= ?`,
      [emp.id, fromDate, toDate]
    );
    for (const ws of oldWs) {
      await db.query(`DELETE FROM hr_work_schedule_details WHERE work_schedule_id=?`, [ws.id]);
      await db.query(`DELETE FROM hr_work_schedules WHERE id=?`, [ws.id]);
    }

    // Tạo work_schedule cả tháng
    const [ws] = await db.query(
      `INSERT INTO hr_work_schedules (employee_id, from_date, to_date, note) VALUES (?,?,?,?)`,
      [emp.id, fromDate, toDate, `Seed ${month}`]
    );
    const wsId = ws.insertId;

    let empCount = 0;
    for (let di = 0; di < workDates.length; di++) {
      const date    = workDates[di];
      const dow     = new Date(date).getDay();
      const shiftList = getShiftPattern(ei, di, dow, shifts);

      for (const shift of shiftList) {
        const startTime = shift.start_time || '07:00:00';
        const endTime   = shift.end_time   || '15:00:00';

        const [wsd] = await db.query(
          `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time) VALUES (?,?,?,?,?,?)`,
          [wsId, emp.id, shift.id, date, startTime, endTime]
        );
        await generateAttendance(emp.id, wsd.insertId, date, shift.code, startTime);
        empCount++;
      }
    }

    totalCount += empCount;
    console.log(`  ✅ ${emp.full_name.padEnd(25)} ${empCount} ca`);
  }

  console.log(`\n✨ Hoàn thành! Tổng ${totalCount} bản ghi phân ca + chấm công mock.\n`);
  process.exit(0);
}

seed().catch(e => { console.error('❌ Lỗi:', e.message); process.exit(1); });