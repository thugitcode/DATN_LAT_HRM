require('dotenv').config();
const db = require('./config/db');
async function check() {
  const [[c1]] = await db.query(`SELECT COUNT(*) as c FROM hr_work_schedules`);
  const [[c2]] = await db.query(`SELECT COUNT(*) as c FROM hr_work_schedule_details`);
  const [[c3]] = await db.query(`
    SELECT COUNT(*) as c FROM hr_work_schedules 
    WHERE from_date >= '2026-06-01' AND to_date <= '2026-06-30'`);
  console.log('hr_work_schedules total:', c1.c);
  console.log('hr_work_schedule_details total:', c2.c);
  console.log('hr_work_schedules tháng 6:', c3.c);
  
  // Xem 1 NV có bao nhiêu WS trong 1 ngày
  const [rows] = await db.query(`
    SELECT employee_id, DATE_FORMAT(from_date,'%Y-%m-%d') as date, COUNT(*) as cnt
    FROM hr_work_schedules
    WHERE from_date = '2026-06-01'
    GROUP BY employee_id, from_date
    ORDER BY cnt DESC LIMIT 5`);
  console.log('\nSố WS per NV ngày 01/06:');
  rows.forEach(r => console.log(' emp:', r.employee_id, '| count:', r.cnt));
  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });