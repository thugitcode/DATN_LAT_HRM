import type { PaginationMeta } from '.';
import type { StaffPosition } from './global.type';

export enum ShiftTypeEnum {
  FIXED = 'FIXED', // Ca cố định
  FLEXIBLE = 'FLEXIBLE', // Ca linh hoạt
  ON_DUTY = 'ON_DUTY', // Ca trực
  SPLIT = 'SPLIT', // Ca gãy
}
export interface Staff {
  id: string;
  code: string;
  name: string;
  avatar: string | null;
  position: StaffPosition;
  departmentId: string;
  departmentName: string;
}

export interface ShiftManagementParams {
  page?: number;
  limit?: number;
  staffId?: string;
  staffCode?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  position?: StaffPosition;
  search?: string;
  month?: string;

  [key: string]: unknown;
}

export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  shiftTemplateName: string;
  shiftTemplateCode?: string;
  shiftTemplateId?: string;
  shiftTemplateType: ShiftTypeEnum;
}

export interface DaySchedule {
  date: string;
  dayOfWeek: number;
  shifts: Shift[];
}

export interface StaffSchedule {
  staff: Staff;
  schedules: DaySchedule[];
}

export interface ShiftManagementResponse {
  schedules: StaffSchedule[];
  pagination: PaginationMeta;
  message: string;
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
export interface UpdateStaffSchedule {}
