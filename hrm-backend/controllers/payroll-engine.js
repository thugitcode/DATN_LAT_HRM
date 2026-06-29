// tinh luongg
const db = require('../config/db');

const STANDARD_DAYS  = 26;
const OT_RATE        = 1.5;
const ON_CALL_RATE   = 150000;
const SELF_DEDUCT    = 11000000;
const DEP_DEDUCT     = 4400000;

// Thuế TNCN lũy tiến VN
function calcPIT(taxable) {
  if (taxable <= 0) return 0;
  const brackets = [
    [5000000,  0.05],
    [10000000, 0.10],
    [18000000, 0.15],
    [32000000, 0.20],
    [52000000, 0.25],
    [80000000, 0.30],
    [Infinity, 0.35],
  ];
  let tax = 0, rem = taxable, prev = 0;
  for (const [limit, rate] of brackets) {
    const band = Math.min(rem, limit - prev);
    tax += band * rate;
    rem -= band; prev = limit;
    if (rem <= 0) break;
  }
  return Math.round(tax);
}

async function calcPayroll(staffId, month) {
  const fromDate = `${month}-01`;
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const toDate  = `${month}-${String(lastDay).padStart(2,'0')}`;

  // ── 0. Lấy hợp đồng + hồ sơ lương ──────────────────────────
  const [[contract]] = await db.query(`
    SELECT c.base_salary, c.insurance_salary,
           c.job_title_code
    FROM hr_contracts c
    WHERE c.employee_id=? AND c.status='ACTIVE'
    ORDER BY c.start_date DESC LIMIT 1
  `, [staffId]);

  const [[sal]] = await db.query(
    `SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`, [staffId]);

  const baseSalary    = parseFloat(contract?.base_salary   || sal?.gross_salary || 0);
  const insuranceBase = parseFloat(contract?.insurance_salary || contract?.base_salary || baseSalary);

  // ── 1. Chấm công ─────────────────────────────────────────────
  const [wsdRows] = await db.query(`
    SELECT wsd.status, wsd.check_in_time, wsd.check_out_time,
           st.shift_type, st.code as shift_code, st.start_time
    FROM hr_work_schedule_details wsd
    JOIN hr_work_schedules ws ON ws.id=wsd.work_schedule_id
    JOIN shifts st ON st.id=wsd.shift_template_id
    WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?
  `, [staffId, fromDate, toDate]);

  const isNight = r =>
    r.shift_type==='ON_CALL' ||
    ['D','Đ'].includes((r.shift_code||'').toUpperCase()) ||
    (r.start_time||'').startsWith('21') ||
    (r.start_time||'').startsWith('22');

  // Ngày lễ từ bảng holidays (UTC+7)
  const [holidays] = await db.query(`
    SELECT DATE_FORMAT(DATE_ADD(start_date, INTERVAL 7 HOUR),'%Y-%m-%d') as hdate
    FROM holidays
    WHERE DATE_FORMAT(DATE_ADD(start_date, INTERVAL 7 HOUR),'%Y-%m')=?
  `, [month]);
  const holidaySet = new Set(holidays.map(h => h.hdate));

  // Giải trình APPROVED
  const [explRows] = await db.query(`
    SELECT DATE_FORMAT(work_date,'%Y-%m-%d') as wdate, status
    FROM hr_attendance_explanations
    WHERE employee_id=? AND work_date BETWEEN ? AND ? AND status='APPROVED'
  `, [staffId, fromDate, toDate]);
  const approvedDates = new Set(explRows.map(e => e.wdate));

  const present    = wsdRows.filter(r => ['PRESENT','LATE','EARLY_LEAVE'].includes(r.status));
  const workDays   = present.filter(r => !isNight(r)).length;
  const onCallDays = present.filter(r => isNight(r)).length;

  // Nghỉ bù trực
  const compRestDays = wsdRows.filter(r => r.status==='COMPENSATORY_LEAVE').length;

  // Nghỉ lễ (từ bảng holidays)
  const holidayDays = wsdRows.filter(r => r.status==='HOLIDAY').length;

  // Nghỉ phép hưởng lương (từ WSD + đơn APPROVED)
  const wsdPaidLeave = wsdRows.filter(r => ['LEAVE','LEAVE_PAID'].includes(r.status)).length;
  const [[leaveRow]] = await db.query(`
    SELECT COALESCE(SUM(total_days),0) as cnt
    FROM hr_leave_requests
    WHERE employee_id=? AND status='APPROVED'
    AND from_date BETWEEN ? AND ?
  `, [staffId, fromDate, toDate]);
  const paidLeave = wsdPaidLeave + parseInt(leaveRow?.cnt||0);

  // Vắng không phép
  const absentDays    = wsdRows.filter(r => r.status==='ABSENT').length;
  const approvedAbsents = wsdRows.filter(r => r.status==='ABSENT' && approvedDates.has(r.work_date?.toISOString?.()?.slice(0,10)||r.work_date)).length;
  const unpaidAbsents = Math.max(0, absentDays - approvedAbsents);

  // TỔNG CÔNG hưởng lương = ngày làm + trực + nghỉ bù + nghỉ lễ + nghỉ phép
  // totalWorkDays = ngày đi làm thực tế + trực + lễ + nghỉ phép
  // compRestDays: nghỉ bù trực → tính lương nhưng không đếm vào công đi làm
  const totalWorkDays = workDays + onCallDays + holidayDays + paidLeave;
  // Nhưng khi tính lương, nghỉ bù được hưởng nguyên ngày lương
  const totalWorkDaysForSalary = workDays + onCallDays + compRestDays + holidayDays + paidLeave;

  // Ngày chuẩn trong tháng (trừ CN)
  let workingDaysInMonth = 0;
  for (let i=1; i<=lastDay; i++) {
    if (new Date(y, m-1, i).getDay() !== 0) workingDaysInMonth++;
  }
  const standardWorkingDays = Math.min(STANDARD_DAYS, workingDaysInMonth);

  // Giờ OT
  let overtimeHours = 0;
  present.forEach(r => {
    if (!r.check_in_time || !r.check_out_time) return;
    const diff = (new Date(r.check_out_time) - new Date(r.check_in_time)) / 3600000;
    const h = diff < 0 ? diff + 24 : diff;
    const std = isNight(r) ? 9 : 8;
    overtimeHours += Math.max(0, h - std);
  });
  overtimeHours = Math.round(overtimeHours * 100) / 100;

  // Vi phạm (đi muộn)
  const lateRows = wsdRows.filter(r => r.status==='LATE');
  let violationPenalty = 0;
  lateRows.forEach(r => {
    if (!r.check_in_time || !r.start_time) return;
    const actualIn = new Date(r.check_in_time);
    const [sh, sm] = r.start_time.split(':').map(Number);
    const scheduled = new Date(actualIn);
    scheduled.setUTCHours(sh-7, sm, 0);
    const lateMinutes = (actualIn - scheduled) / 60000;
    if (lateMinutes > 15) violationPenalty += Math.ceil(lateMinutes/30) * 50000;
  });

  // ── 2. Phụ cấp từ hr_staff_salary ────────────────────────────
  const hazardAllowance   = parseFloat(sal?.hazard_allowance||0);
  const mealAllowance     = sal?.meal_allowance_unit==='DAY'
    ? parseFloat(sal?.meal_allowance||0) * totalWorkDays
    : parseFloat(sal?.meal_allowance||0);
  const phoneAllowance    = parseFloat(sal?.phone_allowance||0);
  const positionAllowance = parseFloat(sal?.position_allowance||0);
  const otherAllowance    = parseFloat(sal?.other_allowance||0);
  const fuelAllowance     = parseFloat(sal?.fuel_allowance||0);
  const bizTripAllowance  = parseFloat(sal?.business_trip_allowance||0);

  // ── 3. Thu nhập ngoài ────────────────────────────────────────
  // KPI bonus
  const [[kpiRow]] = await db.query(`
    SELECT kpi_score, status FROM hr_staff_kpi
    WHERE employee_id=? AND DATE_FORMAT(DATE_ADD(month, INTERVAL 7 HOUR),'%Y-%m')=?
    AND status='CONFIRMED' LIMIT 1
  `, [staffId, month]).catch(()=>[[null]]);
  const kpiScore = parseFloat(kpiRow?.kpi_score||0);
  const kpiBonus = 0; // KPI ảnh hưởng đến thưởng nhưng chưa có công thức tiền → để 0

  // Doanh số bonus
  const [[revRow]] = await db.query(`
    SELECT actual_amount, target_amount, achievement_rate FROM hr_staff_revenue
    WHERE employee_id=? AND DATE_FORMAT(DATE_ADD(month, INTERVAL 7 HOUR),'%Y-%m')=?
    AND status='CONFIRMED' LIMIT 1
  `, [staffId, month]).catch(()=>[[null]]);
  const revenueRate   = parseFloat(revRow?.achievement_rate||0);
  const revenueBonus  = 0; // Doanh số theo tỷ lệ nhưng chưa có công thức → để 0

  // Thu nhập khác
  const [[otherRow]] = await db.query(`
    SELECT COALESCE(SUM(amount),0) as total FROM hr_other_income
    WHERE employee_id=? AND DATE_FORMAT(DATE_ADD(month, INTERVAL 7 HOUR),'%Y-%m')=?
  `, [staffId, month]).catch(()=>[[{total:0}]]);
  const otherIncomeAmount = parseFloat(otherRow?.total||0);

  // ── 4. BƯỚC 1: Tính Gross ────────────────────────────────────
  const salaryByWork   = baseSalary > 0 ? Math.round((baseSalary / standardWorkingDays) * totalWorkDays) : 0;
  const onCallSalary   = onCallDays * ON_CALL_RATE;
  const overtimeAmount = baseSalary > 0 ? Math.round((baseSalary / STANDARD_DAYS / 8) * overtimeHours * OT_RATE) : 0;
  const totalAllowance = Math.round(hazardAllowance + mealAllowance + phoneAllowance + positionAllowance + otherAllowance + fuelAllowance + bizTripAllowance + otherIncomeAmount);

  const totalGross = salaryByWork + onCallSalary + overtimeAmount + totalAllowance + kpiBonus + revenueBonus;

  // ── 5. BƯỚC 2: Bảo hiểm ─────────────────────────────────────
  const siRate    = sal?.has_social_insurance     ? parseFloat(sal?.social_insurance_rate||8)    : 0;
  const hiRate    = sal?.has_health_insurance      ? parseFloat(sal?.health_insurance_rate||1.5)  : 0;
  const uiRate    = sal?.has_unemployment_insurance? parseFloat(sal?.unemployment_insurance_rate||1): 0;
  const unionRate = sal?.has_union_fee             ? 1 : 0;

  const socialIns  = Math.round(insuranceBase * siRate  / 100);
  const healthIns  = Math.round(insuranceBase * hiRate  / 100);
  const unemployIns= Math.round(insuranceBase * uiRate  / 100);
  const unionFee   = Math.round(insuranceBase * unionRate / 100);
  const totalIns   = socialIns + healthIns + unemployIns + unionFee;

  // ── 6. BƯỚC 3: Thuế TNCN ────────────────────────────────────
  const dependents  = parseInt(sal?.dependents_count||0);
  const depDeduct   = dependents * DEP_DEDUCT;
  const taxable     = Math.max(0, totalGross - totalIns - SELF_DEDUCT - depDeduct);
  const pit         = calcPIT(taxable);

  // ── 7. BƯỚC 4: Phạt vi phạm ─────────────────────────────────
  // totalIns đã bao gồm unionFee rồi → không cộng lại
  const totalDeduction = totalIns + pit + violationPenalty;
  const netIncome      = Math.max(0, totalGross - totalDeduction);

  return {
    // Công
    standardWorkingDays, totalWorkDays,
    workDays, onCallDays, compRestDays, holidayDays, paidLeave,
    unpaidAbsents, absentDays, overtimeHours,
    // Thu nhập
    baseSalary, insuranceBase, salaryByWork, onCallSalary, overtimeAmount,
    totalAllowance, hazardAllowance, mealAllowance, phoneAllowance,
    positionAllowance, otherAllowance, fuelAllowance, bizTripAllowance,
    kpiBonus, kpiScore, revenueBonus, revenueRate, otherIncomeAmount,
    bonusAmount: kpiBonus + revenueBonus,
    totalGross,
    // Bảo hiểm
    socialIns, healthIns, unemployIns, unionFee, totalIns,
    // Thuế
    taxable, pit,
    // Vi phạm
    violationPenalty,
    // Tổng
    totalDeduction, netIncome,
  };
}

module.exports = { calcPayroll, calcPIT };