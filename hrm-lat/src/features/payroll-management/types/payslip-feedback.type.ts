import type { Item } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

export interface AllowanceBreakdown {
  fuel: number;
  meal: number;
  phone: number;
  hazard: number;
  position: number;
  responsibility: number;
}

export interface InsuranceBreakdown {
  health_2pct: number;
  social_8pct: number;
  unemployment_1pct: number;
}

export interface CalculationDetails {
  hourlyRate: number;
  standardDays: number;
  overtimeHours: number;
  actualWorkDays: number;
  basicSalaryBase: number;
  totalLateMinutes: number;
  totalEarlyMinutes: number;
  allowanceBreakdown: AllowanceBreakdown;
  insuranceBreakdown: InsuranceBreakdown;
}

export interface PayrollPeriod {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: string;
  month: string;
  name: string;
  fromDate: string;
  toDate: string;
  standardWorkingDays: number;
  status: PayrollPeriodStatus;
  note: string | null;
}
export interface PayrollResult {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: string;
  basicSalary: string;
  allowanceAmount: string;
  overtimeAmount: string;
  bonusAmount: string;
  deductionAmount: string;
  insuranceAmount: string;
  taxAmount: string;
  netPay: string;
  calculationDetails: CalculationDetails;
  isPaid: boolean;
  paidAt: string | null;
  payslipStatus: PayslipStatus;
  payslipChannel: string | null;
  payslipSentAt: string | null;
  payrollPeriod: PayrollPeriod;
  employeeContribution: number;
  personalIncomeTax: number;
  totalGross: number;
  workDays: number;
  totalAttendance: number;
  overtimeHours: number;
  onCallDays: number;
  businessTripDays: number;
  advancePayment: number;
}

export enum PayslipStatus {
  NOT_SENT = 'NOT_SENT',
  SENT = 'SENT',
}

export enum PayrollPeriodStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export interface StaffPayslipFeedback {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: string;
  externalId: string;
  avatar: string;
  code: string;
  name: string;
  hospitalId: string | null;
  birthday: string;
  phone: string;
  email: string;
  password: string;
  status: 'WORKING' | 'OFF';
  activeStatus: 'ACTIVE' | 'INACTIVE';
  academicTitles: string[];
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  identity: string;
  identityIssueDate: string;
  identityIssuePlace: string;
  nationality: string;
  address: string;
  qualification: string;
  major: string;
  certificateNumber: string;
  certificateIssuePlace: string;
  certificateExpiryDate: string;
  jobTitle: { id: string; name: string };
  position: string;
  role: string;
  taxCode: string;
  insuranceNumber: string;
  healthInsuranceNumber: string;
  accountNumber: string;
  beneficiaryName: string;
  bankName: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  emergencyContactAddress: string;
  emergencyContactRelationship: string;
  pinCode: string | null;
  note: string;
  contractExpiryDate: string;
  currentContractType: string;
  currentWorkType: string;
  currentShiftType: string;
  faceIdEnabled: boolean;
  faceIdResetAt: string | null;
  permission: unknown;
  modulePermission: unknown;
  managementModule: unknown;
  isSendPasswordEmail: boolean;

  departments: Item[];
  rooms: Item[];
}
export enum PayslipFeedbackStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}
export interface PayslipFeedback {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: string;
  content: string;
  responseContent: string | null;
  status: PayslipFeedbackStatus;
  resolvedAt: string | null;
  staff: StaffPayslipFeedback;
  payroll: PayrollResult;
  period: {
    id: string;
    month: string;
    name: string;
    fromDate: string;
    toDate: string;
  };
}
