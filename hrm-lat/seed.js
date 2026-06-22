// Seed script - chạy: node seed.js [month]
// Ví dụ: node seed.js 2026-06
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
async function resolveShiftTimes(shiftId) {
  const [[sh]] = await db.query(`SELECT start_time, end_time, code FROM shifts WHERE id=?`, [shiftId]);
  return { startTime: sh?.start_time || '07:00:00', endTime: sh?.end_time || '15:00:00', code: sh?.code || '' };
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
  } else if (code === 'D' || code === 'Đ' || st.startsWith('21') || st.startsWith('22')) {
    const next = new Date(date); next.setDate(next.getDate() + 1);
    checkIn = `${date} 21:55:00`; checkOut = `${next.toISOString().slice(0,10)} 06:05:00`;
  } else {
    checkIn = `${date} ${st.slice(0,8)}`; checkOut = `${date} 17:00:00`;
  }
  await db.query(
    `UPDATE hr_work_schedule_details SET check_in_time=?,check_out_time=?,status='PRESENT' WHERE id=?`,
    [checkIn, checkOut, wsdId]
  );
}

async function seed() {
  console.log(`\n🌱 Seeding phân ca cho tháng ${month}...\n`);
  const fromDate = `${month}-01`;
  const toDate = getLastDay(month);
  const dates = getDateRange(fromDate, toDate).filter(d => new Date(d).getDay() !== 0);

  const [employees] = await db.query(`SELECT id, full_name FROM hr_employees WHERE status != 'RESIGNED' LIMIT 12`);
  const [shifts] = await db.query(`SELECT id, code, start_time FROM shifts ORDER BY id LIMIT 4`);

  if (!shifts.length) { console.log('❌ Chưa có ca làm việc nào!'); process.exit(1); }

  console.log(`👤 ${employees.length} nhân viên | 📅 ${dates.length} ngày | 🕐 ${shifts.length} loại ca\n`);

  let totalCount = 0;
  for (const emp of employees) {
    // Xóa phân ca cũ trong tháng
    const [oldWs] = await db.query(
      `SELECT id FROM hr_work_schedules WHERE employee_id=? AND from_date >= ? AND to_date <= ?`,
      [emp.id, fromDate, toDate]
    );
    for (const ws of oldWs) {
      await db.query(`DELETE FROM hr_work_schedule_details WHERE work_schedule_id=?`, [ws.id]);
      await db.query(`DELETE FROM hr_work_schedules WHERE id=?`, [ws.id]);
    }

    // Tạo 1 work_schedule cả tháng
    const [ws] = await db.query(
      `INSERT INTO hr_work_schedules (employee_id, from_date, to_date, note) VALUES (?,?,?,?)`,
      [emp.id, fromDate, toDate, `Seed ${month}`]
    );
    const wsId = ws.insertId;

    let empCount = 0;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const shift = shifts[i % shifts.length];
      const { startTime, endTime, code } = await resolveShiftTimes(shift.id);

      const [wsd] = await db.query(
        `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time) VALUES (?,?,?,?,?,?)`,
        [wsId, emp.id, shift.id, date, startTime, endTime]
      );
      await generateAttendance(emp.id, wsd.insertId, date, code, startTime);
      empCount++;
    }

    totalCount += empCount;
    console.log(`  ✅ ${emp.full_name}: ${empCount} ca`);
  }

  console.log(`\n✨ Hoàn thành! Đã tạo ${totalCount} bản ghi phân ca + chấm công.\n`);
  process.exit(0);
}

seed().catch(e => { console.error('❌ Lỗi:', e.message); process.exit(1); });