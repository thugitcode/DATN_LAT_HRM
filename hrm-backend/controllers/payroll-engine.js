// payroll engine - tính lương động theo template
const db = require('../config/db');
const { Parser } = require('expr-eval');

const parser = new Parser();

// biểu thuế TNCN lũy tiến VN
function calcPIT(taxable, brackets) {
  if (taxable <= 0) return 0;
  const bands = brackets?.length ? brackets : [
    { from: 0,        to: 5000000,   rate: 5   },
    { from: 5000000,  to: 10000000,  rate: 10  },
    { from: 10000000, to: 18000000,  rate: 15  },
    { from: 18000000, to: 32000000,  rate: 20  },
    { from: 32000000, to: 52000000,  rate: 25  },
    { from: 52000000, to: 80000000,  rate: 30  },
    { from: 80000000, to: Infinity,  rate: 35  },
  ];
  let tax = 0, rem = taxable;
  for (const band of bands) {
    if (rem <= 0) break;
    const size = Math.min(rem, (band.to || Infinity) - band.from);
    tax += size * band.rate / 100;
    rem -= size;
  }
  return Math.round(tax);
}

// đánh giá công thức an toàn
function evalFormula(formula, vars) {
  if (!formula) return 0;
  try {
    return Math.round(parser.evaluate(formula, vars) || 0);
  } catch {
    return 0;
  }
}

// ── Bước 1: Tìm template phù hợp với nhân viên ──────────────
async function findTemplate(employeeId) {
  // Lấy thông tin NV
  const [[emp]] = await db.query(
    `SELECT e.id, e.employee_code,
            c.department_code, c.room_code, c.level_name
     FROM hr_employees e
     LEFT JOIN hr_contracts c ON c.employee_id = e.id AND c.status = 'ACTIVE'
     WHERE e.id = ? LIMIT 1`,
    [employeeId]
  );
  if (!emp) return null;

  console.log('[findTemplate] emp:', emp.employee_code, '| dept:', emp.department_code, '| room:', emp.room_code, '| pos:', emp.level_name);


  // Lấy tất cả template ACTIVE
  const [templates] = await db.query(
    `SELECT * FROM payroll_templates WHERE status = 'ACTIVE' ORDER BY id ASC`
  );

  // Match template theo thứ tự ưu tiên: employee > position > room > department
  for (const tpl of templates) {
    const appliedEmps  = tpl.applied_employees  ? JSON.parse(tpl.applied_employees)  : [];
    const appliedPos   = tpl.applied_positions  ? JSON.parse(tpl.applied_positions)  : [];
    const appliedRooms = tpl.applied_rooms       ? JSON.parse(tpl.applied_rooms)      : [];
    const appliedDepts = tpl.applied_departments ? JSON.parse(tpl.applied_departments): [];

    console.log('[findTemplate] tpl', tpl.id, '| depts:', appliedDepts, '| rooms:', appliedRooms, '| pos:', appliedPos);

  
    if (appliedEmps.includes(emp.employee_code))    return tpl;
    if (appliedPos.includes(emp.level_name))         return tpl;
    if (appliedRooms.includes(emp.room_code))        return tpl;
    if (appliedDepts.includes(emp.department_code)) return tpl;
  }

    console.log('[findTemplate] NO MATCH — dùng fallback');

  return null;
}

// ── Bước 2: Lấy danh sách thành phần lương theo template ────
async function loadComponents(templateId) {
  const [rows] = await db.query(
    `SELECT ptd.column_key, ptd.component_code, ptd.display_name,
            ptd.custom_formula, ptd.sort_order,
            sc.formula AS base_formula, sc.nature, sc.name
     FROM payroll_template_details ptd
     LEFT JOIN salary_components sc ON sc.code = ptd.component_code
     WHERE ptd.template_id = ?
     ORDER BY ptd.sort_order ASC`,
    [templateId]
  );
  return rows;
}

// ── Bước 3: Thu thập biến số tháng ──────────────────────────
async function collectVars(staffId, month) {
  const fromDate = `${month}-01`;
  const [y, m]   = month.split('-').map(Number);
  const lastDay  = new Date(y, m, 0).getDate();
  const toDate   = `${month}-${String(lastDay).padStart(2,'0')}`;

  // Hợp đồng + cấu hình lương
  const [[contract]] = await db.query(
    `SELECT base_salary, insurance_salary FROM hr_contracts
     WHERE employee_id=? AND status='ACTIVE' ORDER BY start_date DESC LIMIT 1`,
    [staffId]
  );
  const [[sal]] = await db.query(
    `SELECT * FROM hr_staff_salary WHERE employee_id=? LIMIT 1`,
    [staffId]
  );

  // Cấu hình thuế từ DB
  const [taxConfig] = await db.query(`SELECT config_key, config_value FROM cat_tax_global_config`);
  const taxMap = Object.fromEntries(taxConfig.map(r => [r.config_key, parseFloat(r.config_value)]));
  const selfDeduction = taxMap['SELF_DEDUCTION']  || 11000000;
  const depDeduction  = taxMap['DEPENDENT_DEDUCTION'] || 4400000;

  // Biểu thuế từ DB
  const [brackets] = await db.query(
    `SELECT from_amount as \`from\`, to_amount as \`to\`, tax_rate as rate
     FROM cat_tax_brackets ORDER BY from_amount ASC`
  );

  // Chấm công
  const [wsdRows] = await db.query(
    `SELECT wsd.status, wsd.check_in_time, wsd.check_out_time,
            st.shift_type, st.code as shift_code, st.start_time
     FROM hr_work_schedule_details wsd
     JOIN hr_work_schedules ws ON ws.id = wsd.work_schedule_id
     JOIN shifts st ON st.id = wsd.shift_template_id
     WHERE ws.employee_id=? AND wsd.work_date BETWEEN ? AND ?`,
    [staffId, fromDate, toDate]
  );

  const isNight = r =>
    r.shift_type === 'ON_CALL' ||
    (r.start_time || '').startsWith('21') ||
    (r.start_time || '').startsWith('22');

  const present    = wsdRows.filter(r => ['PRESENT','LATE','EARLY_LEAVE'].includes(r.status));
  const workDays   = present.filter(r => !isNight(r)).length;
  const onCallDays = present.filter(r => isNight(r)).length;
  const holidayDays = wsdRows.filter(r => r.status === 'HOLIDAY').length;
  const compDays    = wsdRows.filter(r => r.status === 'COMPENSATORY_LEAVE').length;
  const wsdPaid     = wsdRows.filter(r => ['LEAVE','LEAVE_PAID'].includes(r.status)).length;

  // Nghỉ phép có lương
  const [[leaveRow]] = await db.query(
    `SELECT COALESCE(SUM(total_days),0) as cnt FROM hr_leave_requests
     WHERE employee_id=? AND status='APPROVED' AND from_date BETWEEN ? AND ?`,
    [staffId, fromDate, toDate]
  );
  const paidLeave = wsdPaid + parseInt(leaveRow?.cnt || 0);
  const totalWorkDays = workDays + onCallDays + compDays + holidayDays + paidLeave;

  // Ngày chuẩn trong tháng (trừ CN)
  let standardDays = 0;
  for (let i = 1; i <= lastDay; i++) {
    if (new Date(y, m - 1, i).getDay() !== 0) standardDays++;
  }
  standardDays = Math.min(26, standardDays);

  // Giờ OT
  let overtimeHours = 0;
  present.forEach(r => {
    if (!r.check_in_time || !r.check_out_time) return;
    const diff = (new Date(r.check_out_time) - new Date(r.check_in_time)) / 3600000;
    const h = diff < 0 ? diff + 24 : diff;
    const std = isNight(r) ? 9 : 8;
    overtimeHours += Math.max(0, h - std);
  });

  // Phạt vi phạm
  let violationPenalty = 0;
  wsdRows.filter(r => r.status === 'LATE').forEach(r => {
    if (!r.check_in_time || !r.start_time) return;
    const actualIn = new Date(r.check_in_time);
    const [sh, sm] = r.start_time.split(':').map(Number);
    const scheduled = new Date(actualIn);
    scheduled.setUTCHours(sh - 7, sm, 0);
    const lateMin = (actualIn - scheduled) / 60000;
    if (lateMin > 15) violationPenalty += Math.ceil(lateMin / 30) * 50000;
  });

  // KPI
  const [[kpiRow]] = await db.query(
    `SELECT kpi_score FROM hr_staff_kpi
     WHERE employee_id=? AND DATE_FORMAT(DATE_ADD(month, INTERVAL 7 HOUR),'%Y-%m')=?
     AND status='CONFIRMED' LIMIT 1`,
    [staffId, month]
  ).catch(() => [[null]]);

  // Doanh số
  const [[revRow]] = await db.query(
    `SELECT actual_amount, achievement_rate FROM hr_staff_revenue
     WHERE employee_id=? AND DATE_FORMAT(DATE_ADD(month, INTERVAL 7 HOUR),'%Y-%m')=?
     AND status='CONFIRMED' LIMIT 1`,
    [staffId, month]
  ).catch(() => [[null]]);

  // Thu nhập khác
  const [[otherRow]] = await db.query(
    `SELECT COALESCE(SUM(amount),0) as total FROM hr_other_income
     WHERE employee_id=? AND DATE_FORMAT(DATE_ADD(month, INTERVAL 7 HOUR),'%Y-%m')=?`,
    [staffId, month]
  ).catch(() => [[{ total: 0 }]]);

  const baseSalary    = parseFloat(contract?.base_salary    || sal?.gross_salary || 0);
  const insuranceBase = parseFloat(contract?.insurance_salary || contract?.base_salary || baseSalary);
  const kpiScore      = parseFloat(kpiRow?.kpi_score || 0);
  const revenueActual = parseFloat(revRow?.actual_amount || 0);
  const revenueRate   = parseFloat(revRow?.achievement_rate || 0);

  // Tỷ lệ thưởng doanh số từ hr_staff_salary (nếu có field, mặc định 0)
  const revenueBonusRate = parseFloat(sal?.revenue_bonus_rate || 0);

  return {
    // Biến lương cơ bản
    LUONG_CO_BAN:          baseSalary,
    LUONG_DONG_BH:         insuranceBase,
    NGAY_CHUAN:            standardDays,

    // Biến công
    TONG_NGAY_CONG:        totalWorkDays,
    NGAY_LAM_THUONG:       workDays,
    SO_CA_TRUC:            onCallDays,
    NGAY_LE:               holidayDays,
    NGAY_NGHI_PHEP:        paidLeave,
    GIO_OT:                Math.round(overtimeHours * 100) / 100,

    // Biến KPI / doanh số
    KPI_SCORE:             kpiScore,
    DOANH_SO_THUC_TE:      revenueActual,
    DOANH_SO_TY_LE:        revenueRate,
    THUONG_DOANH_SO_RATE:  revenueBonusRate,

    // Biến phụ cấp cố định từ hr_staff_salary
    PHU_CAP_TRUA_NGAY:     parseFloat(sal?.meal_allowance    || 0),
    PHU_CAP_DIEN_THOAI_SO: parseFloat(sal?.phone_allowance   || 0),
    PHU_CAP_XANG_XE_SO:    parseFloat(sal?.fuel_allowance    || 0),
    PHU_CAP_DOC_HAI_SO:    parseFloat(sal?.hazard_allowance  || 0),
    PHU_CAP_CONG_TAC_SO:   parseFloat(sal?.business_trip_allowance || 0),
    PHU_CAP_CHUC_VU_SO:    parseFloat(sal?.position_allowance || 0),
    THU_NHAP_KHAC_SO:      parseFloat(otherRow?.total || 0),

    // Biến bảo hiểm
    BHXH_RATE:   sal?.has_social_insurance      ? parseFloat(sal?.social_insurance_rate      || 8)   : 0,
    BHYT_RATE:   sal?.has_health_insurance       ? parseFloat(sal?.health_insurance_rate      || 1.5) : 0,
    BHTN_RATE:   sal?.has_unemployment_insurance ? parseFloat(sal?.unemployment_insurance_rate|| 1)   : 0,

    // Biến phạt
    PHAT_VI_PHAM_SO: violationPenalty,

    // Placeholder — sẽ được tính động sau
    TONG_GROSS:      0,
    TONG_KHAU_TRU:   0,
    THUE_TNCN_TINH:  0,

    // Meta — dùng nội bộ engine
    _selfDeduction: selfDeduction,
    _depDeduction:  depDeduction,
    _dependents:    parseInt(sal?.dependents_count || 0),
    _brackets:      brackets,
    _hasPIT:        sal?.has_personal_income_tax ? true : false,
  };
}

// ── Bước 4 + 5: Tính theo template và trả kết quả ───────────
async function calcPayroll(staffId, month) {
  // Tìm template
  const template = await findTemplate(staffId);

  // Nếu không có template → dùng engine cũ fallback
  if (!template) {
    return calcPayrollFallback(staffId, month);
  }

  // Load components
  const components = await loadComponents(template.id);

  // Thu thập biến số
  const vars = await collectVars(staffId, month);

  // Tính từng thành phần theo thứ tự
  const results = {};
  let totalGross    = 0;
  let totalDeduct   = 0;
  let totalIncome   = 0;

  for (const comp of components) {
    const formula = comp.custom_formula || comp.base_formula;
    if (!formula) { results[comp.component_code] = 0; continue; }

    // Thành phần đặc biệt: thuế TNCN — phải tính sau khi có TONG_GROSS và TONG_KHAU_TRU (trừ thuế)
    if (comp.component_code === 'THUE_TNCN') {
      const insTotal = (results['BHXH_NLD'] || 0) + (results['BHYT_NLD'] || 0) +
                       (results['BHTN_NLD'] || 0) + (results['CONG_DOAN'] || 0);
      const taxable = Math.max(
        0,
        totalIncome - insTotal - vars._selfDeduction - (vars._dependents * vars._depDeduction)
      );
      const pit = vars._hasPIT ? calcPIT(taxable, vars._brackets) : 0;
      results['THUE_TNCN'] = pit;
      vars['THUE_TNCN_TINH'] = pit;
      totalDeduct += pit;
      continue;
    }

    // Thành phần tổng hợp: Net = Gross - Khấu trừ
    if (comp.component_code === 'THU_NHAP_THUC_LINH') {
      const net = Math.max(0, totalGross - totalDeduct);
      results['THU_NHAP_THUC_LINH'] = net;
      continue;
    }

    // Cập nhật vars với các kết quả đã tính trước
    vars['TONG_GROSS']   = totalGross;
    vars['TONG_KHAU_TRU'] = totalDeduct;

    const value = evalFormula(formula, vars);
    results[comp.component_code] = value;

    // Phân loại gross / khấu trừ
    if (comp.nature === 'Thu nhập') {
      totalIncome += value;
      totalGross  += value;
      vars['TONG_GROSS'] = totalGross;
    } else if (comp.nature === 'Khấu trừ') {
      totalDeduct += value;
      vars['TONG_KHAU_TRU'] = totalDeduct;
    }
  }

  const netIncome = Math.max(0, totalGross - totalDeduct);

    console.log('[calcPayroll] template:', template.id, '| components:', components.length);
    console.log('[calcPayroll] vars BHXH_RATE:', vars.BHXH_RATE, '| LUONG_DONG_BH:', vars.LUONG_DONG_BH);
    console.log('[calcPayroll] results:', JSON.stringify(results));
  // Trả về đúng format cũ để controller không cần sửa
  return {
    // template info
    templateId:   template.id,
    templateName: template.name,
    components:   components.map(c => ({
      code:        c.component_code,
      name:        c.display_name || c.name,
      nature:      c.nature,
      value:       results[c.component_code] || 0,
      column_key:  c.column_key,
      sort_order:  c.sort_order,
    })),

    // backward-compat fields
    standardWorkingDays: vars.NGAY_CHUAN,
    totalWorkDays:       vars.TONG_NGAY_CONG,
    workDays:            vars.NGAY_LAM_THUONG,
    onCallDays:          vars.SO_CA_TRUC,
    holidayDays:         vars.NGAY_LE,
    paidLeave:           vars.NGAY_NGHI_PHEP,
    overtimeHours:       vars.GIO_OT,
    baseSalary:          vars.LUONG_CO_BAN,
    insuranceBase:       vars.LUONG_DONG_BH,
    kpiScore:            vars.KPI_SCORE,
    revenueRate:         vars.DOANH_SO_TY_LE,

    salaryByWork:        results['LUONG_THEO_CONG']    || 0,
    onCallSalary:        results['PHU_CAP_TRUC']       || 0,
    overtimeAmount:      results['LUONG_TANG_CA']      || 0,
    kpiBonus:            results['THUONG_KPI']         || 0,
    revenueBonus:        results['THUONG_DOANH_SO']    || 0,
    mealAllowance:       results['PHU_CAP_AN_TRUA']    || 0,
    phoneAllowance:      results['PHU_CAP_DIEN_THOAI'] || 0,
    hazardAllowance:     results['PHU_CAP_DOC_HAI']    || 0,
    positionAllowance:   results['PHU_CAP_CHUC_VU']    || 0,
    fuelAllowance:       results['PHU_CAP_XANG_XE']    || 0,
    bizTripAllowance:    results['PHU_CAP_CONG_TAC']   || 0,
    otherIncomeAmount:   results['THU_NHAP_KHAC']      || 0,
    totalAllowance:      results['PHU_CAP_AN_TRUA']    || 0,
    bonusAmount:        (results['THUONG_KPI'] || 0) + (results['THUONG_DOANH_SO'] || 0),

    socialIns:           results['BHXH_NLD']    || 0,
    healthIns:           results['BHYT_NLD']    || 0,
    unemployIns:         results['BHTN_NLD']    || 0,
    unionFee:            results['CONG_DOAN']   || 0,
    totalIns:           (results['BHXH_NLD']    || 0) +
                        (results['BHYT_NLD']    || 0) +
                        (results['BHTN_NLD']    || 0) +
                        (results['CONG_DOAN']   || 0),

    pit:                 results['THUE_TNCN']       || 0,
    violationPenalty:    results['PHAT_VI_PHAM']    || 0,
    totalGross,
    totalDeduction:      totalDeduct,
    netIncome,
  };
}

// ── Fallback: engine cũ hardcode dùng khi NV chưa có template ─
async function calcPayrollFallback(staffId, month) {
  const vars = await collectVars(staffId, month);

  const baseSalary    = vars.LUONG_CO_BAN;
  const insuranceBase = vars.LUONG_DONG_BH;
  const standardDays  = vars.NGAY_CHUAN;
  const totalWorkDays = vars.TONG_NGAY_CONG;

  const salaryByWork   = baseSalary > 0 ? Math.round((baseSalary / standardDays) * totalWorkDays) : 0;
  const onCallSalary   = vars.SO_CA_TRUC * 150000;
  const overtimeAmount = baseSalary > 0
    ? Math.round((baseSalary / 26 / 8) * vars.GIO_OT * 1.5) : 0;
  const kpiBonus = vars.KPI_SCORE >= 90 ? Math.round(baseSalary * 0.15)
                 : vars.KPI_SCORE >= 70 ? Math.round(baseSalary * 0.10) : 0;
  const revenueBonus = Math.round(vars.DOANH_SO_THUC_TE * vars.THUONG_DOANH_SO_RATE / 100);
  const totalAllowance = vars.PHU_CAP_TRUA_NGAY * totalWorkDays
    + vars.PHU_CAP_DIEN_THOAI_SO + vars.PHU_CAP_XANG_XE_SO
    + vars.PHU_CAP_DOC_HAI_SO + vars.PHU_CAP_CONG_TAC_SO
    + vars.PHU_CAP_CHUC_VU_SO + vars.THU_NHAP_KHAC_SO;

  const totalGross = salaryByWork + onCallSalary + overtimeAmount + kpiBonus + revenueBonus + totalAllowance;

  const socialIns  = Math.round(insuranceBase * vars.BHXH_RATE / 100);
  const healthIns  = Math.round(insuranceBase * vars.BHYT_RATE / 100);
  const unemployIns= Math.round(insuranceBase * vars.BHTN_RATE / 100);
  const unionFee   = Math.round(insuranceBase * 0.01);
  const totalIns   = socialIns + healthIns + unemployIns + unionFee;

  const taxable = Math.max(0, totalGross - totalIns - vars._selfDeduction - vars._dependents * vars._depDeduction);
  const pit     = vars._hasPIT ? calcPIT(taxable, vars._brackets) : 0;

  const totalDeduction = totalIns + pit + vars.PHAT_VI_PHAM_SO;
  const netIncome      = Math.max(0, totalGross - totalDeduction);

  return {
    templateId: null, templateName: 'Mặc định', components: [],
    standardWorkingDays: standardDays, totalWorkDays,
    workDays: vars.NGAY_LAM_THUONG, onCallDays: vars.SO_CA_TRUC,
    holidayDays: vars.NGAY_LE, paidLeave: vars.NGAY_NGHI_PHEP,
    overtimeHours: vars.GIO_OT, baseSalary, insuranceBase,
    kpiScore: vars.KPI_SCORE, revenueRate: vars.DOANH_SO_TY_LE,
    salaryByWork, onCallSalary, overtimeAmount, kpiBonus, revenueBonus,
    mealAllowance: vars.PHU_CAP_TRUA_NGAY * totalWorkDays,
    phoneAllowance: vars.PHU_CAP_DIEN_THOAI_SO,
    hazardAllowance: vars.PHU_CAP_DOC_HAI_SO,
    positionAllowance: vars.PHU_CAP_CHUC_VU_SO,
    fuelAllowance: vars.PHU_CAP_XANG_XE_SO,
    bizTripAllowance: vars.PHU_CAP_CONG_TAC_SO,
    otherIncomeAmount: vars.THU_NHAP_KHAC_SO,
    totalAllowance, bonusAmount: kpiBonus + revenueBonus,
    socialIns, healthIns, unemployIns, unionFee, totalIns,
    taxable, pit, violationPenalty: vars.PHAT_VI_PHAM_SO,
    totalGross, totalDeduction, netIncome,
  };
}

module.exports = { calcPayroll, calcPIT };