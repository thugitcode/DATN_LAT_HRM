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

      // Lấy thông tin lương từ hợp đồng ACTIVE
      const [[contract]] = await db.query(
        `SELECT c.base_salary, c.insurance_salary,
                c.contract_type, c.working_type, c.level_name,
                ct.name AS job_title_name
         FROM hr_contracts c
         LEFT JOIN cat_titles ct ON ct.id = c.job_title_code
         WHERE c.employee_id = ? AND c.status = 'ACTIVE'
         LIMIT 1`,
        [staffId]
      );

      // Lấy thông tin lương chi tiết nếu có bảng riêng
      const [salaryRows] = await db.query(
        `SELECT * FROM hr_staff_salary WHERE employee_id = ? LIMIT 1`,
        [staffId]
      ).catch(() => [[]]); // Nếu bảng chưa có thì trả rỗng

      const salaryDetail = salaryRows[0] || {};

      ok(res, {
        // Lương cơ bản từ hợp đồng
        baseSalary:      contract?.base_salary      || 0,
        insuranceSalary: contract?.insurance_salary || 0,
        // Chi tiết lương từ bảng salary
        salaryType:      salaryDetail.salary_type   || 'GROSS',
        netSalary:       salaryDetail.net_salary     || 0,
        grossSalary:     salaryDetail.gross_salary   || 0,
        // Phụ cấp
        responsibilityAllowance: salaryDetail.responsibility_allowance || 0,
        positionAllowance:       salaryDetail.position_allowance       || 0,
        hazardAllowance:         salaryDetail.hazard_allowance         || 0,
        mealAllowance:           salaryDetail.meal_allowance           || 0,
        fuelAllowance:           salaryDetail.fuel_allowance           || 0,
        phoneAllowance:          salaryDetail.phone_allowance          || 0,
        businessTripAllowance:   salaryDetail.business_trip_allowance  || 0,
        otherAllowance:          salaryDetail.other_allowance          || 0,
        // Thuế & bảo hiểm
        familyDeduction:   salaryDetail.family_deduction  || 11000000,
        dependentsCount:   salaryDetail.dependents_count  || 0,
        taxRate:           salaryDetail.tax_rate           || null,
        // Bảo hiểm
        healthInsurance:        salaryDetail.health_insurance         || 1.5,
        socialInsurance:        salaryDetail.social_insurance         || 8,
        unemploymentInsurance:  salaryDetail.unemployment_insurance   || 1,
        unionFee:               salaryDetail.union_fee                || 1,
        // Sức khỏe
        healthcareInsurance:    salaryDetail.healthcare_insurance     || 0,
        insuranceCompany:       salaryDetail.insurance_company        || null,
        benefitLevel:           salaryDetail.benefit_level            || null,
        // Nghỉ phép
        annualLeaveDays:        salaryDetail.annual_leave_days        || 12,
        sickLeaveDays:          salaryDetail.sick_leave_days          || 30,
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
      const b = req.body;

      // Cập nhật base_salary và insurance_salary vào hr_contracts
      if (b.baseSalary !== undefined || b.insuranceSalary !== undefined) {
        const fields = [];
        const vals   = [];
        if (b.baseSalary !== undefined)      { fields.push('base_salary = ?');      vals.push(b.baseSalary); }
        if (b.insuranceSalary !== undefined) { fields.push('insurance_salary = ?'); vals.push(b.insuranceSalary); }
        if (fields.length) {
          vals.push(staffId);
          await db.query(
            `UPDATE hr_contracts SET ${fields.join(', ')} WHERE employee_id = ? AND status = 'ACTIVE'`,
            vals
          );
        }
      }

      // Upsert bảng hr_staff_salary
      const salaryFields = {
        salary_type:              b.salaryType,
        net_salary:               b.netSalary,
        gross_salary:             b.grossSalary,
        responsibility_allowance: b.responsibilityAllowance,
        position_allowance:       b.positionAllowance,
        hazard_allowance:         b.hazardAllowance,
        meal_allowance:           b.mealAllowance,
        fuel_allowance:           b.fuelAllowance,
        phone_allowance:          b.phoneAllowance,
        business_trip_allowance:  b.businessTripAllowance,
        other_allowance:          b.otherAllowance,
        family_deduction:         b.familyDeduction,
        dependents_count:         b.dependentsCount,
        tax_rate:                 b.taxRate,
        health_insurance:         b.healthInsurance,
        social_insurance:         b.socialInsurance,
        unemployment_insurance:   b.unemploymentInsurance,
        union_fee:                b.unionFee,
        healthcare_insurance:     b.healthcareInsurance,
        insurance_company:        b.insuranceCompany,
        benefit_level:            b.benefitLevel,
        annual_leave_days:        b.annualLeaveDays,
        sick_leave_days:          b.sickLeaveDays,
      };

      // Lọc bỏ undefined
      const cleanFields = Object.fromEntries(
        Object.entries(salaryFields).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanFields).length > 0) {
        const cols = Object.keys(cleanFields);
        const vals2 = Object.values(cleanFields);

        await db.query(
          `INSERT INTO hr_staff_salary (employee_id, ${cols.join(', ')})
           VALUES (?, ${cols.map(() => '?').join(', ')})
           ON DUPLICATE KEY UPDATE ${cols.map(c => `${c} = VALUES(${c})`).join(', ')}`,
          [staffId, ...vals2]
        ).catch(() => {}); // Nếu bảng chưa có thì bỏ qua
      }

      ok(res, null, 'Cập nhật lương thành công');
    } catch (e) {
      console.error('[PATCH /staff-salary]', e);
      fail(res, 500, 'Lỗi cập nhật lương', e);
    }
  },
};

module.exports = staffSalaryController;