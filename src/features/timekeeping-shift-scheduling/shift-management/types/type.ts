import type { StaffPosition } from '@/types/global.type';
import type { Shift, ShiftTypeEnum, StaffSchedule } from '@/types/shift-management.type';

export interface DayColumn {
  day: number;
  dayOfWeek: number;
  date: string;
}

export interface ShiftCell {
  code: string;
  time: string;
  type?: ShiftTypeEnum;
  name?: string;
  startTime?: string;
  endTime?: string;
}

export interface StaffRow {
  id: string;
  name: string;
  role: StaffPosition;
  code: string;
  department?: string;
  avatar?: string;
  scheduleRows: Array<Array<ShiftCell | null>>;
}

export interface CellDataShift {
  record: StaffSchedule;
  shift: Shift;
  date: string;
  day: number;
  month: number;
  year: number;
  dayOfWeek: number;
}

interface BaseEntity {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: string;
}

interface Staff extends BaseEntity {
  externalId: string;
  avatar: string | null;
  code: string;
  name: string;
  hospitalId: string | null;
  birthday: string;
  phone: string;
  email: string;
  status: string;
  activeStatus: string;
  academicTitles: string[];
  gender: string;
  identity: string;
  identityIssueDate: string | null;
  identityIssuePlace: string;
  nationality: string;
  address: string;
  qualification: string;
  major: string;
  certificateNumber: string;
  certificateIssuePlace: string;
  certificateExpiryDate: string | null;
  jobTitle: string;
  position: StaffPosition;
  role: string;
  taxCode: string;
  insuranceNumber: string;
  accountNumber: string;
  beneficiaryName: string;
  bankName: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  emergencyContactAddress: string;
  emergencyContactRelationship: string;
  note: string;
  contractExpiryDate: string | null;
  currentContractType: string;
  currentWorkType: string;
  currentShiftType: string | null;
  faceIdEnabled: boolean;
  faceIdResetAt: string | null;
  permission: unknown | null;
  modulePermission: unknown | null;
  managementModule: unknown | null;
}

interface ShiftTemplate extends BaseEntity {
  code: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  coefficient: string;
  standardHours: string;
  color: string;
  allowedLateMinutes: number;
  allowedEarlyLeaveMinutes: number;
  handoverTime: string | null;
  dutyAllowance: string;
  compensatoryType: string;
  compensatoryCoefficient: string;
  restTimeAfterShift: string | null;
  note: string;
  isAutoGenerateCode: boolean;
  status: string;
}

interface Department extends BaseEntity {
  externalId: string;
  hospitalId: string;
  code: string;
  mohCode: string | null;
  name: string;
  englishName: string | null;
  note: string | null;
  type: string;
  status: string;
}

interface Room extends BaseEntity {
  externalId: string;
  hospitalId: string;
  code: string;
  name: string;
  englishName: string | null;
  note: string | null;
  examinationForm: string | null;
  phcForm: string | null;
  machineId: string | null;
  machineCode: string | null;
  machineName: string | null;
  machineType: string | null;
  machineAet: string | null;
  machineModel: string | null;
  isConclusionRoom: boolean;
  startTime: string | null;
  endTime: string | null;
  status: string;
  type: string;
}

export interface WorkScheduleDetail extends BaseEntity {
  startTime: string;
  endTime: string;
  noteStartTime: string | null;
  noteEndTime: string | null;
  workDate: string;
  status: string;
  note: string;
  assignedBy: string | null;
  staff: Staff;
  shiftTemplate: ShiftTemplate;
  department: Department;
  room: Room;
}
