import type { PaginationMeta } from '.';
import type { StaffPosition } from './global.type';

export interface ShiftManagementParams {
  page?: number;
  limit?: number;
  staffId?: string;
  staffCode?: string;
  departmentId?: string;
  roomId?: string;
  startDate?: string;
  endDate?: string;
  position?: StaffPosition;
  search?: string;
  month?: string;
  status?: string;
  getAll?: boolean;

  [key: string]: unknown;
}

export enum ShiftTypeEnum {
  FIXED = 'FIXED', // Ca cố định
  FLEXIBLE = 'FLEXIBLE', // Ca linh hoạt
  ON_DUTY = 'ON_DUTY', // Ca trực
  SPLIT = 'SPLIT', // Ca gãy
}

export interface DepartmentUser {
  id: string;
  name: string;
}

export interface RoomUser {
  id: string;
  name: string;
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  birthday: string;
  gender: 'MALE' | 'FEMALE' | string;
  phone: string;
  email: string;
  avatar: string;
  jobTitle: string;
  position: string;
  currentWorkType: string | null;
  contractExpiryDate: string | null;
  status: string;
  activeStatus: string;
  isExpiringSoon: boolean;
  departments: DepartmentUser[];
  rooms: RoomUser[];
}

interface Department {
  id: string;
  name: string;
}
interface Room {
  id: string;
  name: string;
}

export interface StaffWorkSchedule {
  id: string;
  code: string;
  name: string;
  avatar: string | null;
  position: StaffPosition;
  departments: Department[];
  rooms: Room[];
}

export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  shiftTemplateName: string;
  shiftTemplateCode?: string;
  shiftTemplateId?: string;
  shiftTemplateType: ShiftTypeEnum;
  workScheduleId: string;
  workScheduleDetailId: string;
}

export interface DaySchedule {
  date: string;
  dayOfWeek: number;
  shifts: Shift[];
}

export interface StaffSchedule {
  staff: StaffWorkSchedule;
  schedules: DaySchedule[];
}

export interface ShiftManagementResponse {
  schedules: StaffSchedule[];
  pagination: PaginationMeta;
  message: string;
}

export interface DaySchedule {
  date: string;
  dayOfWeek: number;
  shifts: Shift[];
}

export interface CreateStaffSchedule {
  staffId: string;
  departmentId: string;
  roomId: string;
  fromDate: string;
  toDate: string;
  note?: string;
  details: {
    startTime: string;
    endTime: string;
    shiftTemplateId: string;
    note?: string;
  }[];
}

export enum StatusUpdateShift {
  SCHEDULED = 'SCHEDULED',
}

export interface UpdateShiftData {
  note?: string;
  roomId: string;
  departmentId?: string;
  status: StatusUpdateShift | null;
  details: {
    startTime: string;
    endTime: string;
    shiftTemplateId: string;
    note?: string;
  }[];
}

export interface UpdateShift {
  id: string;
  data: UpdateShiftData;
}
