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

export enum ContractTypeEnum {
  FULL_TIME = 'FULL_TIME',
  PROBATION = 'PROBATION',
  INTERNSHIP = 'INTERNSHIP',
  EXPERT_COOPERATION = 'EXPERT_COOPERATION',
}

export interface StaffParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  jobTitle?: string;
  departmentIds?: string[];
  roomIds?: string[];
  contractType?: ContractTypeEnum;
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
}
