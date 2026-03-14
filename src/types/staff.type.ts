import type { Gender, StaffPosition, Status } from './global.type';

export enum StaffJobTitleEnum {
  DOCTOR = 'DOCTOR', // Bác sĩ
  NURSE = 'NURSE', // Điều dưỡng
  TECHNICIAN = 'TECHNICIAN', // Kỹ thuật viên
  MIDWIFE = 'MIDWIFE', // Hộ sinh
  PHYSICIAN_ASSISTANT = 'PHYSICIAN_ASSISTANT', // Y sĩ
  OFFICE_STAFF = 'OFFICE_STAFF', // Nhân viên văn phòng
  MANAGEMENT = 'MANAGEMENT', // Quản trị
  LAB_TECHNICIAN = 'LAB_TECHNICIAN', // Kỹ thuật viên xét nghiệm
  IMAGING_TECHNICIAN = 'IMAGING_TECHNICIAN', // Kỹ thuật viên chẩn đoán hình ảnh
  CASHIER = 'CASHIER', // Thu ngân
  RECEPTIONIST = 'RECEPTIONIST', // Lễ tân
  WAREHOUSE_KEEPER = 'WAREHOUSE_KEEPER', // Thủ kho
  PHARMACIST = 'PHARMACIST', // Dược sĩ
  SALES = 'SALES', // Sale
  TELESALES = 'TELESALES', // Telesale
  MARKETING = 'MARKETING', // Marketing
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT', // Chăm sóc khách hàng
  MARKETING_LEAD = 'MARKETING_LEAD', // Trưởng nhóm marketing
  CUSTOMER_SUPPORT_LEAD = 'CUSTOMER_SUPPORT_LEAD', // Trưởng nhóm CSKH
}
export enum StaffPositionEnum {
  STAFF = 'STAFF', // Nhân viên
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT', // Trưởng khoa
  DEPUTY_HEAD_OF_DEPARTMENT = 'DEPUTY_HEAD_OF_DEPARTMENT', // Phó khoa
  CHIEF_NURSE = 'CHIEF_NURSE', // Điều dưỡng trưởng
  MANAGER = 'MANAGER', // Trưởng phòng
  HEAD_OF_UNIT = 'HEAD_OF_UNIT', // Trưởng bộ phận
  DEPUTY_MANAGER = 'DEPUTY_MANAGER', // Phó phòng
}
export enum StaffAcademicTitleEnum {
  DOCTOR = 'DOCTOR', // Bác sĩ
  MASTER = 'MASTER', // Thạc sĩ
  PHD = 'PHD', // Tiến sĩ
  SPECIALIST_I = 'SPECIALIST_I', // Bác sĩ chuyên khoa I
  SPECIALIST_II = 'SPECIALIST_II', // Bác sĩ chuyên khoa II
  RESIDENT_PHYSICIAN = 'RESIDENT_PHYSICIAN', // Bác sĩ nội trú
  PROFESSOR = 'PROFESSOR', // Giáo sư
  ASSOCIATE_PROFESSOR = 'ASSOCIATE_PROFESSOR', // Phó giáo sư
  PEOPLES_PHYSICIAN = 'PEOPLES_PHYSICIAN', // Thầy thuốc nhân dân
  EMINENT_PHYSICIAN = 'EMINENT_PHYSICIAN', // Thầy thuốc ưu tú
  BACHELOR = 'BACHELOR', // Cử nhân
  ENGINEER = 'ENGINEER', // Kỹ sư
}

export enum StaffStatusEnum {
  WORKING = 'WORKING', // Đang làm việc
  RESIGNED = 'RESIGNED', // Đã nghỉ việc
  PENDING = 'PENDING', // Chờ nhận việc
}

export enum StaffQualificationEnum {
  INTERMEDIATE = 'INTERMEDIATE', // Trung cấp
  COLLEGE = 'COLLEGE', // Cao đẳng
  BACHELOR = 'BACHELOR', // Cử nhân
  DOCTOR = 'DOCTOR', // Bác sĩ
  MASTER = 'MASTER', // Thạc sĩ
  PHD = 'PHD', // Tiến sĩ
  SPECIALIST_DOCTOR = 'SPECIALIST_DOCTOR', // Bác sĩ chuyên khoa
  OTHER = 'OTHER', // Khác
}

export enum ContractTypeEnum {
  FULL_TIME = 'FULL_TIME', // Nhân viên chính thức
  PROBATION = 'PROBATION', // Nhân viên thử việc
  INTERNSHIP = 'INTERNSHIP', // Nhân viên học việc
  EXPERT_COOPERATION = 'EXPERT_COOPERATION', // Chuyên gia hợp tác
}

export enum ShiftTypeEnum {
  FIXED = 'FIXED', // Ca cố định
  FLEXIBLE = 'FLEXIBLE', // Ca linh hoạt
  SPLIT = 'SPLIT', // Ca gãy
}

export enum ContractStatusEnum {
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Chờ duyệt
  PENDING_SIGNATURE = 'PENDING_SIGNATURE', // Chờ ký
  SIGNED = 'SIGNED', // Đã ký
  EXPIRED = 'EXPIRED', // Đã hết hạn
}

export enum DurationUnitEnum {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

export interface StaffWorkHistory {
  id: string;
  jobTitle: StaffJobTitleEnum;
  position: StaffPositionEnum;
  contractNumber: string;
  contractType: ContractTypeEnum;
  workType: string;
  duration: number;
  durationUnit: DurationUnitEnum;
  startDate: string;
  endDate: string;
  contractStatus: ContractStatusEnum;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffSalary {
  id: string;
  basicSalary: number;
  insuranceSalary?: number;
  responsibilityAllowance?: number;
  positionAllowance?: number;
  hazardAllowance?: number;
  mealAllowance?: number;
  mealAllowanceUnit?: 'DAY' | 'MONTH';
  fuelAllowance?: number;
  phoneAllowance?: number;
  businessTripAllowance?: number;
  otherAllowance?: number;
  hasHealthInsurance?: boolean;
  healthInsuranceRate?: number;
  hasSocialInsurance?: boolean;
  socialInsuranceRate?: number;
  hasUnemploymentInsurance?: boolean;
  unemploymentInsuranceRate?: number;
  hasUnionFee?: boolean;
  unionFee?: number;
  hasHealthCareInsurance?: boolean;
  healthCareInsuranceCompany?: string;
  healthCareInsuranceBenefit?: number;
  healthCareInsuranceRate?: number;
  leaveQuotaIds?: string[];
  hasFamilyDeduction?: boolean;
  dependentsCount?: number;
  hasPersonalIncomeTax?: boolean;
  personalIncomeTaxRate?: number;
  salaryType: 'GROSS' | 'NET';
  netSalary?: number;
  grossSalary?: number;
}

export interface StaffContract {
  id: string;
  contractType: ContractTypeEnum;
  workType: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  duration: number;
  durationUnit: DurationUnitEnum;
  jobTitle: StaffJobTitleEnum;
  position: StaffPositionEnum;
  staff?: Staff;
  department?: { id: string; name: string };
  room?: { id: string; name: string; department?: { id: string; name: string } };
  directManagerIds?: string[];
  shiftType?: ShiftTypeEnum;
  fixedShiftId?: string;
  workingDays?: number[];
  status: ContractStatusEnum;
  approvedAt?: string;
  approvedBy?: string;
  signedAt?: string;
  signatureUrl?: string;
  staffWorkHistory?: StaffWorkHistory[];
  salary?: StaffSalary;
}

export interface StaffParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  jobTitle?: string;
  positions?: StaffPositionEnum[];
  departmentIds?: string[];
  roomIds?: string[];
  contractType?: ContractTypeEnum;
  getAll?: boolean;
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  birthday: string;
  gender: Gender;
  phone?: string;
  email?: string;
  avatar?: string;
  jobTitle?: StaffJobTitleEnum;
  position?: StaffPosition;
  currentWorkType?: string;
  workType?: string;
  contractExpiryDate?: string;
  endDate?: string;
  status?: Status;
  activeStatus?: 'ACTIVE' | 'INACTIVE';
  isExpiringSoon?: boolean;
  departments?: { id: string; name: string }[];
  rooms?: { id: string; name: string }[];

  // Detail API returns nested relation format
  rlsStaffDepartments?: { id: string; department: { id: string; code?: string; name: string } }[];
  rlsStaffRooms?: {
    id: string;
    room: { id: string; code?: string; name: string; department?: { id: string; name: string } };
  }[];

  // Detail fields
  identity?: string;
  identityIssueDate?: string;
  identityIssuePlace?: string;
  nationality?: string;
  address?: string;
  qualification?: string;
  major?: string;
  certificateNumber?: string;
  certificateIssuePlace?: string;
  certificateExpiryDate?: string;
  taxCode?: string;
  insuranceNumber?: string;
  accountNumber?: string;
  beneficiaryName?: string;
  bankName?: string;
  note?: string;
  currentContractType?: string;
  academicTitles?: StaffAcademicTitleEnum[];
  emergencyContact?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  emergencyContactRelationship?: string;
}
