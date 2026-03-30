export interface Salary {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: string;
  contractId: string;

  basicSalary: string;
  insuranceSalary: string;

  responsibilityAllowance: string;
  positionAllowance: string;
  hazardAllowance: string;
  mealAllowance: string;
  mealAllowanceUnit: 'DAY' | 'MONTH';

  fuelAllowance: string;
  phoneAllowance: string;
  businessTripAllowance: string;
  otherAllowance: string;

  hasHealthInsurance: boolean;
  healthInsuranceRate: string;

  hasSocialInsurance: boolean;
  socialInsuranceRate: string;

  hasUnemploymentInsurance: boolean;
  unemploymentInsuranceRate: string;

  hasUnionFee: boolean;
  unionFee: string;

  hasHealthCareInsurance: boolean;
  healthCareInsuranceCompany: string;
  healthCareInsuranceBenefit: string;
  healthCareInsuranceRate: string;

  leaveQuotaIds: string[];

  hasFamilyDeduction: boolean;
  dependentsCount: number;

  hasPersonalIncomeTax: boolean;
  personalIncomeTaxRate: string;

  salaryType: 'GROSS' | 'NET';

  netSalary: string;
  grossSalary: string;
}

export interface CurrentSummary {
  currentSalary: number;
  lastRaiseDelta: number;
  lastRaiseDate: string;
  lastRaiseBy: string | null;
}

export interface SalaryAndBenefits {
  salary: Salary;
  currentSummary: CurrentSummary;
}
