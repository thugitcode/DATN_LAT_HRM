// Seed hr_staff_salary cho tất cả nhân viên
require('dotenv').config();
const db = require('./config/db');

async function seed() {
  console.log('🌱 Seed hồ sơ lương...\n');

  const [employees] = await db.query(`
    SELECT e.id, e.full_name, jt.name as title_name
    FROM hr_employees e
    LEFT JOIN hr_contracts c ON c.employee_id=e.id AND c.status='ACTIVE'
    LEFT JOIN cat_titles jt ON jt.id=c.job_title_code
    WHERE e.status != 'RESIGNED'
  `);

  // Định mức lương theo chức danh
  const SALARY_MAP = {
    'Bác sĩ':                   { gross: 22000000, hazard: 800000,  meal_unit: 'DAY',   meal: 30000, phone: 200000, position: 500000 },
    'Bác sĩ Chuyên khoa':       { gross: 28000000, hazard: 1000000, meal_unit: 'DAY',   meal: 30000, phone: 300000, position: 800000 },
    'Điều dưỡng':               { gross: 15000000, hazard: 600000,  meal_unit: 'DAY',   meal: 25000, phone: 100000, position: 300000 },
    'Hộ sinh':                  { gross: 14000000, hazard: 600000,  meal_unit: 'DAY',   meal: 25000, phone: 100000, position: 300000 },
    'Kỹ thuật viên':            { gross: 16000000, hazard: 500000,  meal_unit: 'DAY',   meal: 25000, phone: 150000, position: 300000 },
    'Nhân viên văn phòng':      { gross: 12000000, hazard: 0,       meal_unit: 'MONTH', meal: 600000, phone: 200000, position: 200000 },
    'Trưởng phòng':             { gross: 25000000, hazard: 500000,  meal_unit: 'MONTH', meal: 800000, phone: 500000, position: 2000000 },
    'Trưởng khoa':              { gross: 35000000, hazard: 1200000, meal_unit: 'MONTH', meal: 800000, phone: 500000, position: 3000000 },
    'Phó khoa':                 { gross: 30000000, hazard: 1000000, meal_unit: 'MONTH', meal: 800000, phone: 400000, position: 2500000 },
    'DEFAULT':                  { gross: 13000000, hazard: 300000,  meal_unit: 'DAY',   meal: 25000, phone: 100000, position: 200000 },
  };

  let count = 0;
  for (const emp of employees) {
    const sal = SALARY_MAP[emp.title_name] || SALARY_MAP['DEFAULT'];

    // Upsert
    await db.query(`
      INSERT INTO hr_staff_salary 
      (employee_id, salary_type, gross_salary, net_salary,
       hazard_allowance, meal_allowance, meal_allowance_unit,
       phone_allowance, position_allowance, other_allowance,
       has_social_insurance, social_insurance_rate,
       has_health_insurance, health_insurance_rate,
       has_unemployment_insurance, unemployment_insurance_rate,
       has_personal_income_tax, dependents_count, family_deduction,
       annual_leave_days, sick_leave_days)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        gross_salary=VALUES(gross_salary), net_salary=VALUES(net_salary),
        hazard_allowance=VALUES(hazard_allowance),
        meal_allowance=VALUES(meal_allowance), meal_allowance_unit=VALUES(meal_allowance_unit),
        phone_allowance=VALUES(phone_allowance), position_allowance=VALUES(position_allowance),
        updated_at=NOW()
    `, [
      emp.id, 'GROSS', sal.gross, Math.round(sal.gross*0.895),
      sal.hazard, sal.meal, sal.meal_unit,
      sal.phone, sal.position, 0,
      1, 8,   // BHXH 8%
      1, 1.5, // BHYT 1.5%
      1, 1,   // BHTN 1%
      1, 0, 11000000,
      12, 10
    ]);

    count++;
    console.log(`  ✅ ${emp.full_name.padEnd(22)} | ${emp.title_name||'(chưa có HĐ)'} | Gross: ${sal.gross.toLocaleString('vi-VN')}đ`);
  }

  console.log(`\n✨ Seed xong ${count} hồ sơ lương!`);
  process.exit(0);
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });