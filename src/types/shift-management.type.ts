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
