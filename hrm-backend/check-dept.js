require('dotenv').config();
const db = require('./config/db');

async function check() {
  // Lấy Gumayusi_min
  const [[emp]] = await db.query(`SELECT id, full_name FROM hr_employees WHERE full_name LIKE '%Gumayusi_min%' LIMIT 1`);
  if (!emp) { console.log('Không tìm thấy'); process.exit(1); }
  console.log('Nhân viên:', emp.full_name, 'id:', emp.id);

  // Tất cả dept của nhân viên này
  const [depts] = await db.query(`
    SELECT d.id, d.name, d.code, rsd.department_code
    FROM hr_staff_departments rsd
    JOIN cat_departments d ON d.code=rsd.department_code
    WHERE rsd.employee_id=?`, [emp.id]);
  console.log('Depts:', depts.map(d => `id=${d.id} name=${d.name}`).join(', '));

  // work_schedule dept
  const [[ws]] = await db.query(`SELECT id, department_id FROM hr_work_schedules WHERE employee_id=? ORDER BY id DESC LIMIT 1`, [emp.id]);
  console.log('WS department_id:', ws?.department_id);
  console.log('Match:', depts.find(d => d.id == ws?.department_id) ? '✅ CÓ trong list' : '❌ KHÔNG có trong list');

  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });