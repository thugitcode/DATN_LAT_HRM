import type { StaffPosition } from '@/types/global.type';

import type { HoursStatusEnum } from '../constants/data';
import type { HourlyPayrollStatus } from './index.type';

export interface WorkSheetByShiftRow {
  id: string;
  code: string;
  name: string;
  avatar: string | null;
  departments: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
  days: Record<string, WorkDay>;
  summary: Summary;
  position: StaffPosition;
  shift: ShiftTimeKeeping;
}

export interface WorkDay {
  workScheduleDetailId: string;
  date: string;
  displayCode: string;
  shiftStartTime: string;
  shiftEndTime: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workWeight: number;
}

export interface BreakTime {
  id: string;
  name: string;
  breakStartTime: string;
  breakEndTime: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ShiftTimeKeeping {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakTimes: BreakTime[];
}

export interface Department {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface StaffTimeKeeping {
  id: string;
  code: string;
  name: string;
  avatar: string | null;
  departments: Department[];
  rooms: Room[];
  position: StaffPosition;
  status: string;
}

export interface Summary {
  totalWork: number;
  totalLateMinutes: number;
  totalEarlyMinutes: number;
  absentDays: number;
  workDays: number;
  actualWorkDays: number;
  holiday: number;
  onCall: number;
  otherLeave: number;
  overtimeHours: number;
  paidLeave: number;
  totalAttendance: number;
  compHours: number;
  compLeave: number;

  compRest: number;
  socialInsuranceLeave: number;
  unpaidLeave: number;
  violationCount: number;
  totalWorkHours: number;
}

export interface ShiftEntry {
  shift: ShiftTimeKeeping;
  days: Record<string, WorkDay>;
  summary: Summary;
}

export interface WorkSheetByShiftType {
  staff: StaffTimeKeeping;
  shifts: ShiftEntry[];
  summary: Summary;
}

export interface AttendanceByHoursResponse {
  departments: Department[];
  rooms: Room[];
  position: StaffPosition;
  staffId: string;
  staffCode: string;
  staffName: string;
  days: Record<string, DailyHourEntry>;
  totalHours: number;
  standardHours: number;
}

export interface DailyHourEntry {
  date: string;
  dayOfWeek: number;
  hours: number;
  status?: HoursStatusEnum;
}

export type ApprovePayload = {
  // name: string;
  // fromDate: string;
  // toDate: string;
  // standardWorkingDays: number;
  month: string;
};

export enum PeriodStatusEnum {
  DRAFT = 'DRAFT',
  LOCK = 'LOCKED',
  PUBLISHED = 'PUBLISHED',
}

export interface Period {
  id: string;
  name: string;
  fromDate: string;
  toDate: string;
  status: PeriodStatusEnum;
  standardWorkingDays: number;
}

export interface PeriodStatusResponsive {
  period: Period;
  totalStaff: number;
  confirmedCount: number;
  rejectedCount: number;
  pendingCount: number;
  canCalculate: boolean;
}
