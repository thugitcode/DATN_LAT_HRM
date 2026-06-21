const db = require('../config/db');

const ok   = (res, data, message = 'success') =>
  res.status(200).json({ statusCode: 200, data, message });
const fail = (res, status, message, error = null) =>
  res.status(status).json({ statusCode: status, message, error: error?.message || null });

const staffSalaryController = {

  // GET /staff-salary/staff/:staffId
  getByStaff: async (req, res) => {
    try {
      const { staffId } = req.params;

      // Lấy lương cơ bản từ hợp đồng ACTIVE/SIGNED/PENDING
      const [[contract]] = await db.query(
        `SELECT c.base_salary, c.insurance_salary, c.id AS contract_id
         FROM hr_contracts c
         WHERE c.employee_id = ?
         ORDER BY FIELD(c.status,'SIGNED','PENDING_SIGNATURE','PENDING_APPROVAL','ACTIVE','EXPIRED') ASC
         LIMIT 1`,
        [staffId]
      );

      // Lấy chi tiết lương từ hr_staff_salary
      const [[salaryDetail]] = await db.query(
        'SELECT * FROM hr_staff_salary WHERE employee_id = ?',
        [staffId]
      ).catch(() => [[null]]);

      // Map sang đúng cấu trúc FE expect: { salary: Salary }
      ok(res, {
        salary: {
          id:          salaryDetail?.id ? String(salaryDetail.id) : null,
          contractId:  contract?.contract_id ? String(contract.contract_id) : null,
          createdAt:   salaryDetail?.created_at || null,
          updatedAt:   salaryDetail?.updated_at || null,
          deletedAt:   null,

          // Lương cơ bản từ hợp đồng
          basicSalary:     (parseFloat(contract?.base_salary) || 0).toString(),
          insuranceSalary: (parseFloat(contract?.insurance_salary) || 0).toString(),

          // Phụ cấp
          responsibilityAllowance: (parseFloat(salaryDetail?.responsibility_allowance) || 0).toString(),
          positionAllowance:       (parseFloat(salaryDetail?.position_allowance) || 0).toString(),
          hazardAllowance:         (parseFloat(salaryDetail?.hazard_allowance) || 0).toString(),
          mealAllowance:           (parseFloat(salaryDetail?.meal_allowance) || 0).toString(),
          mealAllowanceUnit:       salaryDetail?.meal_allowance_unit || 'DAY',
          fuelAllowance:           (parseFloat(salaryDetail?.fuel_allowance) || 0).toString(),
          phoneAllowance:          (parseFloat(salaryDetail?.phone_allowance) || 0).toString(),
          businessTripAllowance:   (parseFloat(salaryDetail?.business_trip_allowance) || 0).toString(),
          otherAllowance:          (parseFloat(salaryDetail?.other_allowance) || 0).toString(),

          // Bảo hiểm
          hasHealthInsurance:        !!salaryDetail?.has_health_insurance,
          healthInsuranceRate:       (parseFloat(salaryDetail?.health_insurance_rate) || 1.5).toString(),
          hasSocialInsurance:        !!salaryDetail?.has_social_insurance,
          socialInsuranceRate:       (parseFloat(salaryDetail?.social_insurance_rate) || 8).toString(),
          hasUnemploymentInsurance:  !!salaryDetail?.has_unemployment_insurance,
          unemploymentInsuranceRate: (parseFloat(salaryDetail?.unemployment_insurance_rate) || 1).toString(),
          hasUnionFee:               !!salaryDetail?.has_union_fee,
          unionFee:                  (parseFloat(salaryDetail?.union_fee) || 0).toString(),

          // Bảo hiểm sức khỏe
          hasHealthCareInsurance:      !!salaryDetail?.has_healthcare_insurance,
          healthCareInsuranceCompany:  salaryDetail?.insurance_company || '',
          healthCareInsuranceBenefit:  (parseFloat(salaryDetail?.benefit_level) || 0).toString(),
          healthCareInsuranceRate:     (parseFloat(salaryDetail?.healthcare_insurance) || 0).toString(),

          // Nghỉ phép
          leaveQuotaIds: [],

          // Thuế
          hasFamilyDeduction:    !!salaryDetail?.family_deduction,
          dependentsCount:       salaryDetail?.dependents_count || 0,
          hasPersonalIncomeTax:  salaryDetail?.has_personal_income_tax ?? true,
          personalIncomeTaxRate: (parseFloat(salaryDetail?.tax_rate) || 0).toString(),

          // Loại lương và tổng
          salaryType:   salaryDetail?.salary_type || 'NET',
          netSalary:    (parseFloat(salaryDetail?.net_salary) || 0).toString(),
          grossSalary:  (parseFloat(salaryDetail?.gross_salary) || 0).toString(),
        }
      });
    } catch (e) {
      console.error('[GET /staff-salary]', e);
      fail(res, 500, 'Lỗi lấy thông tin lương', e);
    }
  },

  // PATCH /staff-salary/staff/:staffId
  updateByStaff: async (req, res) => {
    try {
      const { staffId } = req.params;
      const salary = req.body.salary || req.body;

      // Cập nhật base_salary và insurance_salary vào hr_contracts
      if (salary.basicSalary !== undefined || salary.insuranceSalary !== undefined) {
        const fields = []; const vals = [];
        if (salary.basicSalary !== undefined)      { fields.push('base_salary = ?');      vals.push(parseFloat(salary.basicSalary) || 0); }
        if (salary.insuranceSalary !== undefined)  { fields.push('insurance_salary = ?'); vals.push(parseFloat(salary.insuranceSalary) || 0); }
        if (fields.length) {
          vals.push(staffId);
          await db.query(
            `UPDATE hr_contracts SET ${fields.join(', ')}
             WHERE employee_id = ?
             ORDER BY FIELD(status,'SIGNED','PENDING_SIGNATURE','PENDING_APPROVAL','ACTIVE','EXPIRED') ASC
             LIMIT 1`,
            vals
          );
        }
      }

      // Upsert hr_staff_salary
      await db.query(
        `INSERT INTO hr_staff_salary (
          employee_id, salary_type, net_salary, gross_salary,
          responsibility_allowance, position_allowance, hazard_allowance,
          meal_allowance, meal_allowance_unit, fuel_allowance, phone_allowance,
          business_trip_allowance, other_allowance,
          has_health_insurance, health_insurance_rate,
          has_social_insurance, social_insurance_rate,
          has_unemployment_insurance, unemployment_insurance_rate,
          has_union_fee, union_fee,
          has_healthcare_insurance, insurance_company, benefit_level, healthcare_insurance,
          family_deduction, dependents_count,
          has_personal_income_tax, tax_rate
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE
          salary_type = VALUES(salary_type),
          net_salary = VALUES(net_salary),
          gross_salary = VALUES(gross_salary),
          responsibility_allowance = VALUES(responsibility_allowance),
          position_allowance = VALUES(position_allowance),
          hazard_allowance = VALUES(hazard_allowance),
          meal_allowance = VALUES(meal_allowance),
          meal_allowance_unit = VALUES(meal_allowance_unit),
          fuel_allowance = VALUES(fuel_allowance),
          phone_allowance = VALUES(phone_allowance),
          business_trip_allowance = VALUES(business_trip_allowance),
          other_allowance = VALUES(other_allowance),
          has_health_insurance = VALUES(has_health_insurance),
          health_insurance_rate = VALUES(health_insurance_rate),
          has_social_insurance = VALUES(has_social_insurance),
          social_insurance_rate = VALUES(social_insurance_rate),
          has_unemployment_insurance = VALUES(has_unemployment_insurance),
          unemployment_insurance_rate = VALUES(unemployment_insurance_rate),
          has_union_fee = VALUES(has_union_fee),
          union_fee = VALUES(union_fee),
          has_healthcare_insurance = VALUES(has_healthcare_insurance),
          insurance_company = VALUES(insurance_company),
          benefit_level = VALUES(benefit_level),
          healthcare_insurance = VALUES(healthcare_insurance),
          family_deduction = VALUES(family_deduction),
          dependents_count = VALUES(dependents_count),
          has_personal_income_tax = VALUES(has_personal_income_tax),
          tax_rate = VALUES(tax_rate)`,
        [
          staffId,
          salary.salaryType || 'NET',
          parseFloat(salary.netSalary) || 0,
          parseFloat(salary.grossSalary) || 0,
          parseFloat(salary.responsibilityAllowance) || 0,
          parseFloat(salary.positionAllowance) || 0,
          parseFloat(salary.hazardAllowance) || 0,
          parseFloat(salary.mealAllowance) || 0,
          salary.mealAllowanceUnit || 'DAY',
          parseFloat(salary.fuelAllowance) || 0,
          parseFloat(salary.phoneAllowance) || 0,
          parseFloat(salary.businessTripAllowance) || 0,
          parseFloat(salary.otherAllowance) || 0,
          salary.hasHealthInsurance ? 1 : 0,
          parseFloat(salary.healthInsuranceRate) || 1.5,
          salary.hasSocialInsurance ? 1 : 0,
          parseFloat(salary.socialInsuranceRate) || 8,
          salary.hasUnemploymentInsurance ? 1 : 0,
          parseFloat(salary.unemploymentInsuranceRate) || 1,
          salary.hasUnionFee ? 1 : 0,
          parseFloat(salary.unionFee) || 0,
          salary.hasHealthCareInsurance ? 1 : 0,
          salary.healthCareInsuranceCompany || null,
          parseFloat(salary.healthCareInsuranceBenefit) || 0,
          parseFloat(salary.healthCareInsuranceRate) || 0,
          salary.hasFamilyDeduction ? 1 : 0,
          parseInt(salary.dependentsCount) || 0,
          salary.hasPersonalIncomeTax ? 1 : 0,
          parseFloat(salary.personalIncomeTaxRate) || 0,
        ]
      );

      ok(res, null, 'Cập nhật lương thành công');
    } catch (e) {
      console.error('[PATCH /staff-salary]', e);
      fail(res, 500, 'Lỗi cập nhật lương', e);
    }
  },
};

module.exports = staffSalaryController;