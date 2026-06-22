// Reset toàn bộ phân ca + chấm công rồi seed lại sạch
require('dotenv').config();
const db = require('./config/db');

async function reset() {
  console.log('🗑️  Xóa toàn bộ dữ liệu phân ca...');
  await db.query(`DELETE FROM hr_work_schedule_details`);
  await db.query(`DELETE FROM hr_work_schedules`);
  await db.query(`DELETE FROM hr_attendance_explanations`);
  const [[c1]] = await db.query(`SELECT COUNT(*) as c FROM hr_work_schedules`);
  const [[c2]] = await db.query(`SELECT COUNT(*) as c FROM hr_work_schedule_details`);
  console.log(`✅ Đã xóa xong. WS: ${c1.c}, WSD: ${c2.c}`);
  process.exit(0);
}
reset().catch(e => { console.error(e.message); process.exit(1); });