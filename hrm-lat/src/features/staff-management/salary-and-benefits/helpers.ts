import type { Salary, SalaryAndBenefits } from '../types/salary-and-benefits';
import type { SalaryFormValues } from './schemas';

export const mapApiToFormValues = (data: SalaryAndBenefits): SalaryFormValues => {
  const salary = data?.salary || ({} as Salary);

  return {
    salary: {
      hasHealthInsurance: !!salary.hasHealthInsurance,
      healthInsuranceRate: salary.healthInsuranceRate?.toString() || '',
      hasSocialInsurance: !!salary.hasSocialInsurance,
      socialInsuranceRate: salary.socialInsuranceRate?.toString() || '',
      hasUnemploymentInsurance: !!salary.hasUnemploymentInsurance,
      unemploymentInsuranceRate: salary.unemploymentInsuranceRate?.toString() || '',
      hasUnionFee: !!salary.hasUnionFee,
      unionFee: salary.unionFee?.toString() || '',

      hasHealthCareInsurance: !!salary.hasHealthCareInsurance,
      healthCareInsuranceCompany: salary.healthCareInsuranceCompany || '',
      healthCareInsuranceBenefit: salary.healthCareInsuranceBenefit?.toString() || '',
      healthCareInsuranceRate: salary.healthCareInsuranceRate?.toString() || '',

      basicSalary: salary.basicSalary?.toString() || '',
      insuranceSalary: salary.insuranceSalary?.toString() || '',
      responsibilityAllowance: salary.responsibilityAllowance?.toString() || '',
      positionAllowance: salary.positionAllowance?.toString() || '',
      hazardAllowance: salary.hazardAllowance?.toString() || '',
      mealAllowance: salary.mealAllowance?.toString() || '',
      mealAllowanceUnit: salary.mealAllowanceUnit || 'DAY',
      fuelAllowance: salary.fuelAllowance?.toString() || '',
      phoneAllowance: salary.phoneAllowance?.toString() || '',
      businessTripAllowance: salary.businessTripAllowance?.toString() || '',
      otherAllowance: salary.otherAllowance?.toString() || '',

      leaveQuotaIds: Array.isArray(salary.leaveQuotaIds) ? [...salary.leaveQuotaIds] : [],

      hasFamilyDeduction: !!salary.hasFamilyDeduction,
      dependentsCount: salary.dependentsCount?.toString() || '',
      hasPersonalIncomeTax: !!salary.hasPersonalIncomeTax,
      personalIncomeTaxRate: salary.personalIncomeTaxRate?.toString() || '',

      salaryType: salary.salaryType || 'NET',
      netSalary: salary.netSalary?.toString() || '',
      grossSalary: salary.grossSalary?.toString() || '',
    }
  }
}


// Hàm helper parse string số (loại bỏ dấu chấm, phẩy)
const parseNumber = (val: string | undefined): number => {
  if (!val) return 0;
  return Number(val.replace(/[^\d.]/g, '')) || 0;
};

// Hàm tính toán chính
export const calculateSalary = (values: SalaryFormValues) => {
  const salary = values?.salary ?? values ?? {};

  const basic = parseNumber(salary.basicSalary);
  const insuranceBase = parseNumber(salary.insuranceSalary) || basic;

  // ===== PHỤ CẤP =====
  const allowances =
    parseNumber(salary.responsibilityAllowance) +
    parseNumber(salary.positionAllowance) +
    parseNumber(salary.hazardAllowance) +
    parseNumber(salary.fuelAllowance) +
    parseNumber(salary.phoneAllowance) +
    parseNumber(salary.businessTripAllowance) +
    parseNumber(salary.otherAllowance);

  // ===== PHỤ CẤP ĂN CA =====
  let mealMonthly = parseNumber(salary.mealAllowance);
  if (salary.mealAllowanceUnit === 'DAY') {
    mealMonthly *= 26;
  }

  // ===== GROSS =====
  const gross = basic + allowances + mealMonthly;

  // ===== BẢO HIỂM =====
  let bhPersonal = 0;

  if (salary.hasSocialInsurance) {
    bhPersonal += insuranceBase * (parseNumber(salary.socialInsuranceRate) / 100 || 0.08);
  }

  if (salary.hasHealthInsurance) {
    bhPersonal += insuranceBase * (parseNumber(salary.healthInsuranceRate) / 100 || 0.015);
  }

  if (salary.hasUnemploymentInsurance) {
    bhPersonal += insuranceBase * (parseNumber(salary.unemploymentInsuranceRate) / 100 || 0.01);
  }

  // ===== CÔNG ĐOÀN =====
  let unionFee = 0;

  if (salary.hasUnionFee) {
    const rawUnion = parseNumber(salary.unionFee);

    if (rawUnion < 100) {
      unionFee = (rawUnion / 100) * basic;
    } else {
      unionFee = rawUnion;
    }
  }

  // ===== THUẾ TNCN =====
  let pit = 0;

  if (salary.hasFamilyDeduction) {
    // NHÁNH 1: Lũy tiến từng phần — giảm trừ bản thân 11tr luôn áp dụng
    const selfDeduction      = 11_000_000;
    const dependentDeduction = parseNumber(salary.dependentsCount) * 4_400_000;
    const familyDeduction    = selfDeduction + dependentDeduction;
    const taxableIncome      = Math.max(0, gross - bhPersonal - familyDeduction - unionFee);
    if (taxableIncome > 0) {
      if      (taxableIncome <=  5_000_000) pit = taxableIncome * 0.05;
      else if (taxableIncome <= 10_000_000) pit =   250_000 + (taxableIncome -  5_000_000) * 0.10;
      else if (taxableIncome <= 18_000_000) pit =   750_000 + (taxableIncome - 10_000_000) * 0.15;
      else if (taxableIncome <= 32_000_000) pit = 1_950_000 + (taxableIncome - 18_000_000) * 0.20;
      else if (taxableIncome <= 52_000_000) pit = 4_750_000 + (taxableIncome - 32_000_000) * 0.25;
      else if (taxableIncome <= 80_000_000) pit = 9_750_000 + (taxableIncome - 52_000_000) * 0.30;
      else                                  pit = 18_150_000 + (taxableIncome - 80_000_000) * 0.35;
    }
  } else if (salary.hasPersonalIncomeTax) {
    // NHÁNH 2: Thuế phẳng cố định (thử việc, vãng lai)
    const flatRate = parseNumber(salary.personalIncomeTaxRate);
    if (flatRate > 0) pit = gross * (flatRate / 100);
  }
  // Không chọn ô nào → pit = 0 (miễn thuế)

  // ===== NET =====
  const net = gross - bhPersonal - pit - unionFee;

  return {
    grossSalary: Math.round(gross),
    netSalary: Math.round(net),
    pit: Math.round(pit),
    insurance: Math.round(bhPersonal),
  };
};