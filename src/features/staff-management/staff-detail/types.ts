// types/contract.type.ts

import type { STAFF_SECTION_KEYS } from "./constants/data";

export interface ContractDetailResponse {
  id: string;
  contractType: string;
  workType: string;
  contractNumber: string;
  startDate: string; // ISO date string
  endDate: string;
  duration: number;
  durationUnit: 'YEAR' | 'MONTH';
  jobTitle: { id: string; name: string };
  position: string;
  department: { id: string; name: string } | null;
  room: { id: string; name: string } | null;
  directManagerIds: string[];
  shiftType: string;
  fixedShiftId: string;
  workingDays: number[];
  status: string;
  approvedAt: string | null;
  approvedBy: string | null;
  signedAt: string | null;
  signatureUrl: string | null;

  staff: {
    id: string;
    code: string;
    name: string;
    avatar: string | null;
    departments: Array<{ id: string; name: string }>; // rlsStaffDepartments
    rooms: Array<{ id: string; name: string; department: { id: string } }>; // rlsStaffRooms
  };

  salary: {
    id: string;
    basicSalary: number;
    insuranceSalary: number;
    responsibilityAllowance: number;
    positionAllowance: number;
    hazardAllowance: number;
    mealAllowance: number;
    mealAllowanceUnit: 'DAY' | 'MONTH';
    fuelAllowance: number;
    phoneAllowance: number;
    businessTripAllowance: number;
    otherAllowance: number;

    hasHealthInsurance: boolean;
    healthInsuranceRate: number;
    hasSocialInsurance: boolean;
    socialInsuranceRate: number;
    hasUnemploymentInsurance: boolean;
    unemploymentInsuranceRate: number;
    hasUnionFee: boolean;
    unionFee: number;

    hasHealthCareInsurance: boolean;
    healthCareInsuranceCompany: string;
    healthCareInsuranceBenefit: number;
    healthCareInsuranceRate: number;

    leaveQuotaIds: string[];

    hasFamilyDeduction: boolean;
    dependentsCount: number;
    hasPersonalIncomeTax: boolean;
    personalIncomeTaxRate: number;

    salaryType: 'GROSS' | 'NET';
    netSalary: number;
    grossSalary: number;
  };

  staffWorkHistory: Array<{
    id: string;
    contractNumber: string;
    contractType: string;
    workType: string;
    jobTitle: { id: string; name: string };
    position: string;
    startDate: string;
    endDate: string;
    contractStatus: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

// Interface cho form values (dùng trong reset)
export interface ContractFormValues {
  contractType: string;
  workType: string;
  jobTitleId: string;
  position: string;
  duration: string;
  durationUnit: 'YEAR' | 'MONTH';
  contractNumber: string;
  startDate: string;
  endDate: string;
  departmentId: string;
  roomId: string;
  directManagerIds: string[];
  shiftType: string;
  fixedShiftId: string;
  workingDays: number[];

  workingAreas: Array<{
    departmentId: string;
    roomId: string;
  }>;

  salary: {
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
    dependentsCount: string;
    hasPersonalIncomeTax: boolean;
    personalIncomeTaxRate: string;

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

    salaryType: 'GROSS' | 'NET';
    netSalary: string;
    grossSalary: string;
  };
}


export enum TAB_KEYS {
  INFO = "info",
  CONTRACT = "contract",
  SALARY = "salary",
  ATTENDANCE = "attendance",
  DOCUMENTS = "documents",

  // Timekeeping tabs
  WORKSHEET_BY_SHIFT = "worksheet_by_shift",
  WORKSHEET_BY_DAY = "worksheet_by_day",
  DETAILED_TIME_SHEET = "detailed_time_sheet",
}

export const staffTabs = [
  { key: TAB_KEYS.INFO, label: "Thông tin nhân viên" },
  { key: TAB_KEYS.CONTRACT, label: "Thông tin hợp đồng" },
  { key: TAB_KEYS.SALARY, label: "Lương và phúc lợi" },
  { key: TAB_KEYS.ATTENDANCE, label: "Quản lý chấm công" },
  { key: TAB_KEYS.DOCUMENTS, label: "Hồ sơ nhân viên" },
];

export type StaffSectionKey = typeof STAFF_SECTION_KEYS[keyof typeof STAFF_SECTION_KEYS];