// utils/mapContractToForm.ts

import type { ContractDetailResponse, ContractFormValues } from "./types";


export const mapContractToFormValues = (contract: ContractDetailResponse): ContractFormValues => {
  const salary = contract.salary || {};

  return {
    // Thông tin hợp đồng
    contractType: contract.contractType || '',
    workType: contract.workType || '',
    jobTitleId: contract.jobTitle?.id || '',
    position: contract.position || '',
    duration: contract.duration?.toString() || '',
    durationUnit: contract.durationUnit || 'YEAR',
    contractNumber: contract.contractNumber || '',
    startDate: contract.startDate || '',
    endDate: contract.endDate || '',
    departmentId: contract.department?.id || '',
    roomId: contract.room?.id || '',
    directManagerIds: contract.directManagerIds || [],
    shiftType: contract.shiftType || '',
    fixedShiftId: contract.fixedShiftId || '',
    workingDays: contract.workingDays || [1, 2, 3, 4, 5],

    // Working areas (từ rlsStaffDepartments + rlsStaffRooms)
    workingAreas: contract.staff?.rlsStaffDepartments?.length > 0
      ? contract.staff.rlsStaffDepartments.map((deptRel: any) => {
          const deptId = deptRel.department?.id || '';
          const matchingRoom = contract.staff?.rlsStaffRooms?.find(
            (roomRel: any) => roomRel.room?.department?.id === deptId
          );
          return {
            departmentId: deptId,
            roomId: matchingRoom?.room?.id || '',
          };
        })
      : [{ departmentId: '', roomId: '' }],

    // Salary object
    salary: {
      // Bảo hiểm & công đoàn
      hasHealthInsurance: !!salary.hasHealthInsurance,
      healthInsuranceRate: salary.healthInsuranceRate?.toString() || '',
      hasSocialInsurance: !!salary.hasSocialInsurance,
      socialInsuranceRate: salary.socialInsuranceRate?.toString() || '',
      hasUnemploymentInsurance: !!salary.hasUnemploymentInsurance,
      unemploymentInsuranceRate: salary.unemploymentInsuranceRate?.toString() || '',
      hasUnionFee: !!salary.hasUnionFee,
      unionFee: salary.unionFee?.toString() || '',

      // Bảo hiểm sức khỏe
      hasHealthCareInsurance: !!salary.hasHealthCareInsurance,
      healthCareInsuranceCompany: salary.healthCareInsuranceCompany || '',
      healthCareInsuranceBenefit: salary.healthCareInsuranceBenefit?.toString() || '',
      healthCareInsuranceRate: salary.healthCareInsuranceRate?.toString() || '',

      // Nghỉ phép
      leaveQuotaIds: Array.isArray(salary.leaveQuotaIds) ? [...salary.leaveQuotaIds] : [],

      // Thuế TNCN
      hasFamilyDeduction: !!salary.hasFamilyDeduction,
      dependentsCount: salary.dependentsCount?.toString() || '',
      hasPersonalIncomeTax: salary.hasPersonalIncomeTax ?? true,
      personalIncomeTaxRate: salary.personalIncomeTaxRate?.toString() || '',

      // Cấu trúc lương
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

      // Thông tin lương
      salaryType: salary.salaryType || 'NET',
      netSalary: salary.netSalary?.toString() || '',
      grossSalary: salary.grossSalary?.toString() || '',
    },
  };
};