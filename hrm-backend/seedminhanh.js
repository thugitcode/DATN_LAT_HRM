require('dotenv').config();
const db = require('./config/db');

async function seed() {
  console.log('🌱 Seed phân ca + chấm công cho Nguyễn Minh Anh...\n');

  const [[emp]] = await db.query(
    `SELECT id, full_name FROM hr_employees WHERE employee_code='NV999' LIMIT 1`);
  if (!emp) { console.log('❌ Không tìm thấy NV999'); process.exit(1); }

  // Xóa data cũ
  const [oldWs] = await db.query(
    `SELECT id FROM hr_work_schedules WHERE employee_id=? AND from_date>='2026-06-01'`, [emp.id]);
  for (const ws of oldWs) {
    await db.query(`DELETE FROM hr_work_schedule_details WHERE work_schedule_id=?`, [ws.id]);
    await db.query(`DELETE FROM hr_work_schedules WHERE id=?`, [ws.id]);
  }
  await db.query(`DELETE FROM hr_attendance_explanations WHERE employee_id=? AND work_date>='2026-06-01'`, [emp.id]);

  const [[dept]] = await db.query(
    `SELECT d.id FROM hr_staff_departments rsd JOIN cat_departments d ON d.code=rsd.department_code WHERE rsd.employee_id=? LIMIT 1`, [emp.id]);
  const [[room]] = await db.query(
    `SELECT r.id FROM hr_staff_rooms rsr JOIN cat_rooms r ON r.code=rsr.room_code WHERE rsr.employee_id=? LIMIT 1`, [emp.id]);

  const [shifts] = await db.query(`SELECT id, name, code, shift_type, start_time, end_time FROM shifts`);
  const hc1 = shifts.find(s => s.code === 'HC_001');
  const hc2 = shifts.find(s => s.code === 'PRO25070014');
  const dem = shifts.find(s => s.code === 'TR1');

  // Lấy ngày lễ tháng 6
  const [holidays] = await db.query(`
    SELECT DATE_FORMAT(DATE_ADD(start_date, INTERVAL 1 DAY), '%Y-%m-%d') as holiday_date, name
    FROM holidays 
    WHERE DATE_FORMAT(DATE_ADD(start_date, INTERVAL 1 DAY), '%Y-%m') = '2026-06'
  `);
  const holidayDates = holidays.map(h => h.holiday_date);
  console.log(`🎌 Ngày lễ tháng 6: ${holidayDates.join(', ') || 'Không có'}`);
  holidays.forEach(h => console.log(`   ${h.holiday_date}: ${h.name}`));

  // Lịch tháng 6
  const schedule = [
    { date: '2026-06-02', shift: hc1,  type: 'WORK' },
    { date: '2026-06-03', shift: hc1,  type: 'WORK' },
    { date: '2026-06-04', shift: hc1,  type: 'WORK' },
    { date: '2026-06-05', shift: hc1,  type: 'WORK' },
    { date: '2026-06-06', shift: dem,  type: 'ONCALL' },
    { date: '2026-06-09', shift: hc2,  type: 'WORK' },
    { date: '2026-06-10', shift: hc2,  type: 'WORK' },  // Ngày lễ → sẽ đánh HOLIDAY
    { date: '2026-06-11', shift: hc2,  type: 'WORK' },
    { date: '2026-06-12', shift: hc2,  type: 'WORK' },
    { date: '2026-06-13', shift: hc2,  type: 'WORK' },
    { date: '2026-06-16', shift: hc1,  type: 'WORK' },
    { date: '2026-06-17', shift: hc1,  type: 'WORK' },
    { date: '2026-06-18', shift: hc1,  type: 'WORK' },
    { date: '2026-06-19', shift: dem,  type: 'ONCALL' },
    { date: '2026-06-20', shift: hc1,  type: 'COMP_REST' }, // Nghỉ bù
    { date: '2026-06-23', shift: hc2,  type: 'WORK' },
    { date: '2026-06-24', shift: hc2,  type: 'WORK' },
    { date: '2026-06-25', shift: hc2,  type: 'WORK' },
    { date: '2026-06-26', shift: hc2,  type: 'WORK' },
    { date: '2026-06-27', shift: hc1,  type: 'WORK' },
  ];

  const calcTime = (date, shift) => {
    if (shift.code === 'HC_001')      return { ci: `${date} 08:25:00`, co: `${date} 17:35:00` };
    if (shift.code === 'PRO25070014') return { ci: `${date} 09:55:00`, co: `${date} 19:05:00` };
    if (shift.code === 'TR1') {
      const next = new Date(date); next.setDate(next.getDate() + 1);
      return { ci: `${date} 21:55:00`, co: `${next.toISOString().slice(0,10)} 06:05:00` };
    }
    return { ci: `${date} 08:00:00`, co: `${date} 17:00:00` };
  };

  let absents = [];

  for (const s of schedule) {
    const deptId = dept?.id || null;
    const roomId = room?.id || null;

    // Nghỉ bù trực
    if (s.type === 'COMP_REST') {
      const [ws] = await db.query(
        `INSERT INTO hr_work_schedules (employee_id,department_id,room_id,from_date,to_date,note) VALUES (?,?,?,?,?,?)`,
        [emp.id, deptId, roomId, s.date, s.date, 'Nghỉ bù trực']);
      await db.query(
        `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time,check_in_time,check_out_time,status) VALUES (?,?,?,?,?,?,?,?,?)`,
        [ws.insertId, emp.id, hc1.id, s.date, '00:00:00', '00:00:00', null, null, 'COMPENSATORY_LEAVE']);
      console.log(`  🛏️  ${s.date} | Nghỉ bù trực`);
      continue;
    }

    const { ci, co } = calcTime(s.date, s.shift);

    // Kiểm tra ngày lễ
    if (holidayDates.includes(s.date)) {
      const [ws] = await db.query(
        `INSERT INTO hr_work_schedules (employee_id,department_id,room_id,from_date,to_date,note) VALUES (?,?,?,?,?,?)`,
        [emp.id, deptId, roomId, s.date, s.date, 'Phân ca tháng 6/2026']);
      await db.query(
        `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time,check_in_time,check_out_time,status) VALUES (?,?,?,?,?,?,?,?,?)`,
        [ws.insertId, emp.id, s.shift.id, s.date, s.shift.start_time||'00:00:00', s.shift.end_time||'00:00:00', null, null, 'HOLIDAY']);
      console.log(`  🎌 ${s.date} | ${s.shift.name} | HOLIDAY`);
      continue;
    }

    let checkIn = ci, checkOut = co, status = 'PRESENT';
    const rand = Math.random();
    if (rand < 0.08)      { checkIn = null; checkOut = null; status = 'ABSENT'; }
    else if (rand < 0.18) {
      const d = new Date(ci); d.setMinutes(d.getMinutes() + Math.floor(Math.random()*25+10));
      checkIn = d.toISOString().slice(0,10) + ' ' + d.toTimeString().slice(0,8);
      status = 'LATE';
    }

    const [ws] = await db.query(
      `INSERT INTO hr_work_schedules (employee_id,department_id,room_id,from_date,to_date,note) VALUES (?,?,?,?,?,?)`,
      [emp.id, deptId, roomId, s.date, s.date, 'Phân ca tháng 6/2026']);
    const [wsd] = await db.query(
      `INSERT INTO hr_work_schedule_details (work_schedule_id,employee_id,shift_template_id,work_date,start_time,end_time,check_in_time,check_out_time,status) VALUES (?,?,?,?,?,?,?,?,?)`,
      [ws.insertId, emp.id, s.shift.id, s.date, s.shift.start_time||'00:00:00', s.shift.end_time||'00:00:00', checkIn, checkOut, status]);

    const icon = s.type === 'ONCALL' ? '🌙' : status === 'ABSENT' ? '❌' : status === 'LATE' ? '⚠️' : '✅';
    console.log(`  ${icon} ${s.date} | ${s.shift.name} | ${status}`);

    // Tự động tạo giải trình cho ngày ABSENT và LATE
    if (status === 'ABSENT') {
      absents.push({ wsdId: wsd.insertId, date: s.date, type: 'MISSING_CHECK_IN', reason: 'Vắng mặt không có lý do - cần giải trình' });
    } else if (status === 'LATE') {
      absents.push({ wsdId: wsd.insertId, date: s.date, type: 'LATE_CHECK_IN', reason: 'Đi muộn - cần giải trình lý do' });
    }
  }

  // Tự tạo đơn giải trình cho ngày ABSENT
  if (absents.length) {
    console.log(`\n📋 Tạo đơn giải trình cho ${absents.length} trường hợp...`);
    for (const a of absents) {
      await db.query(`
        INSERT INTO hr_attendance_explanations 
        (employee_id, work_date, type, reason, status, created_at)
        VALUES (?, ?, ?, ?, 'PENDING', NOW())
      `, [emp.id, a.date, a.type, a.reason]);
      console.log(`  📝 ${a.date} | ${a.type} → PENDING`);
    }
  }

  // Tạo 1 đơn nghỉ ốm APPROVED để test liên thông lương
  const [[lq]] = await db.query(`SELECT id FROM cat_leave_quotas WHERE code='SICK' LIMIT 1`);
  if (lq) {
    await db.query(`
      INSERT INTO hr_leave_requests (employee_id, leave_quota_id, from_date, to_date, total_days, reason, status)
      VALUES (?, ?, '2026-06-18', '2026-06-18', 1, 'Nghỉ ốm có đơn bác sĩ', 'APPROVED')
    `, [emp.id, lq.id]);
    console.log(`\n🏥 Tạo đơn nghỉ ốm APPROVED ngày 18/6`);
    // Cập nhật chấm công ngày 18/6 → LEAVE_PAID
    await db.query(`
      UPDATE hr_work_schedule_details wsd
      JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
      SET wsd.status='LEAVE_PAID'
      WHERE ws.employee_id=? AND DATE_FORMAT(wsd.work_date,'%Y-%m-%d')='2026-06-18'
    `, [emp.id]);
    console.log(`  ✅ Chấm công 18/6 → LEAVE_PAID`);
  }

  // Seed lương nếu chưa có
  const [[sal]] = await db.query(`SELECT id FROM hr_staff_salary WHERE employee_id=?`, [emp.id]);
  if (!sal) {
    await db.query(`INSERT INTO hr_staff_salary 
      (employee_id,salary_type,gross_salary,net_salary,hazard_allowance,meal_allowance,meal_allowance_unit,
       phone_allowance,position_allowance,has_social_insurance,social_insurance_rate,
       has_health_insurance,health_insurance_rate,has_unemployment_insurance,unemployment_insurance_rate,
       has_personal_income_tax,dependents_count,family_deduction,annual_leave_days) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [emp.id,'GROSS',22000000,19690000,800000,30000,'DAY',200000,500000,1,8,1,1.5,1,1,1,0,11000000,12]);
    console.log(`\n💰 Tạo hồ sơ lương: Gross 22M`);
  }

  console.log(`\n✨ Xong! Chạy node check-minhanh.js để verify`);
  process.exit(0);
}
seed().catch(e => { console.error('❌', e.message); process.exit(1); });