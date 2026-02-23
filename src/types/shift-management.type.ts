import type { PaginationMeta } from '.';
import type { StaffPosition } from './global.type';

export enum ShiftType {
  MAIN = 'MAIN', // Ca chính
  BROKEN = 'BROKEN', // Ca gãy
  ON_CALL = 'ON_CALL', // Ca trực
  FLEXIBLE = 'FLEXIBLE', // Ca linh hoạt
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
  type: string;
  shiftTemplateName: string;
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
