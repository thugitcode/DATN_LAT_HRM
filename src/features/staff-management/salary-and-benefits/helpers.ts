import type { Salary, SalaryAndBenefits } from '../types/salary-and-benefits';
import type { SalaryFormValues } from './schemas';

export const mapApiToFormValues = (data: SalaryAndBenefits): SalaryFormValues => {
  const salary = data?.salary || ({} as Salary);

  return {
    salary: {
      hasHealthInsurance: salary.hasHealthInsurance ?? false,
      healthInsuranceRate: salary.healthInsuranceRate || '',
      hasSocialInsurance: salary.hasSocialInsurance ?? false,
      socialInsuranceRate: salary.socialInsuranceRate || '',
      hasUnemploymentInsurance: salary.hasUnemploymentInsurance ?? false,
      unemploymentInsuranceRate: salary.unemploymentInsuranceRate || '',
      hasUnionFee: salary.hasUnionFee ?? false,
      unionFee: salary.unionFee || '',

      hasHealthCareInsurance: salary.hasHealthCareInsurance ?? false,
      healthCareInsuranceCompany: salary.healthCareInsuranceCompany || '',
      healthCareInsuranceBenefit: salary.healthCareInsuranceBenefit || '',
      healthCareInsuranceRate: salary.healthCareInsuranceRate || '',

      basicSalary: salary.basicSalary || '',
      insuranceSalary: salary.insuranceSalary || '',
      responsibilityAllowance: salary.responsibilityAllowance || '',
      positionAllowance: salary.positionAllowance || '',
      hazardAllowance: salary.hazardAllowance || '',
      mealAllowance: salary.mealAllowance || '',
      mealAllowanceUnit: salary.mealAllowanceUnit || 'DAY',
      fuelAllowance: salary.fuelAllowance || '',
      phoneAllowance: salary.phoneAllowance || '',
      businessTripAllowance: salary.businessTripAllowance || '',
      otherAllowance: salary.otherAllowance || '',

      leaveQuotaIds: Array.isArray(salary.leaveQuotaIds) ? [...salary.leaveQuotaIds] : [],

      hasFamilyDeduction: salary.hasFamilyDeduction ?? false,
      dependentsCount: salary.dependentsCount?.toString() || '',
      hasPersonalIncomeTax: salary.hasPersonalIncomeTax ?? true,
      personalIncomeTaxRate: salary.personalIncomeTaxRate || '',

      salaryType: salary.salaryType || 'NET',
      netSalary: salary.netSalary || '',
      grossSalary: salary.grossSalary || '',
    },
  };
};

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

  // ===== GIẢM TRỪ GIA CẢNH =====
  let familyDeduction = 0;

  if (salary.hasFamilyDeduction) {
    familyDeduction = 11000000 + parseNumber(salary.dependentsCount) * 4400000;
  }

  // ===== THU NHẬP CHỊU THUẾ =====
  const taxableIncome = Math.max(0, gross - bhPersonal - familyDeduction - unionFee);

  // ===== THUẾ TNCN =====
  let pit = 0;

  if (salary.hasPersonalIncomeTax && taxableIncome > 0) {
    if (taxableIncome <= 5000000) pit = taxableIncome * 0.05;
    else if (taxableIncome <= 10000000) pit = 250000 + (taxableIncome - 5000000) * 0.1;
    else if (taxableIncome <= 18000000) pit = 750000 + (taxableIncome - 10000000) * 0.15;
    else if (taxableIncome <= 32000000) pit = 1950000 + (taxableIncome - 18000000) * 0.2;
    else if (taxableIncome <= 52000000) pit = 4750000 + (taxableIncome - 32000000) * 0.25;
    else if (taxableIncome <= 80000000) pit = 9750000 + (taxableIncome - 52000000) * 0.3;
    else pit = 18150000 + (taxableIncome - 80000000) * 0.35;
  }

  // ===== NET =====
  const net = gross - bhPersonal - pit - unionFee;

  return {
    grossSalary: Math.round(gross),
    netSalary: Math.round(net),
    pit: Math.round(pit),
    insurance: Math.round(bhPersonal),
  };
};
