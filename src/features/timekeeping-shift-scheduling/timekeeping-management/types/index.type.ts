import type { DailyAttendance, IStaff } from '@/types/shift-details.type';
import type { ShiftTypeEnum, Staff } from '@/types/shift-management.type';

import type { Summary } from './timekeeping-management.type';

export enum TAB_KEYS {
  WORKSHEET_BY_SHIFT = 'WORKSHEET_BY_SHIFT',
  HOURLY_PAYROLL = 'HOURLY_PAYROLL',
  DETAILED_TIME_SHEET = 'DETAILED_TIME_SHEET',
}

export interface TabItem {
  label: string;
  key: TAB_KEYS;
}

export enum AttendanceStatus {
  OnTime = 'Đ', // Đúng giờ
  Absent = 'VM', // Vắng mặt
  Late = 'M', // Đi muộn
  EarlyLeave = 'S', // Về sớm
  LateAndEarly = 'M/S', // Vừa muộn vừa về sớm
  Overtime = 'CT', // Công tác
  WorkFromHome = 'WFH', // Làm tại nhà
  ShortHours = 'TG', // Thiếu giờ
  MissingPunch = 'QCC', // Quên chấm công
  PaidLeave = 'P', // Nghỉ phép có lương
  DayOff = 'N', // Ngày nghỉ
}

export enum HourlyPayrollStatus {
  FULL_HOURS = 'FULL_HOURS',
  SHORTAGE = 'SHORTAGE',
  OVERTIME = 'OVERTIME',
  OFF = 'OFF',
}

export enum HoursStatusEnum {
  ON_TIME = 'ON_TIME',
  LATE = 'LATE',
  EARLY = 'EARLY',
  OVERTIME = 'OVERTIME',
  ABSENT = 'ABSENT',
  OFF = 'OFF',
  FULL = 'FULL',
  MISSING = 'MISSING',
  ERROR = 'ERROR',
}

export enum DetailedTimeSheetStatus {
  M = 'M',
  S = 'S',
}

export interface LegendItem {
  status:
    | AttendanceStatus
    | HourlyPayrollStatus
    | DetailedTimeSheetStatus
    | ShiftTypeEnum
    | HoursStatusEnum
    | null;
  label: string;
  color: string;
  shape?: 'circle' | 'ring' | 'line';
}

export type ShiftCode = `${AttendanceStatus}` | 'OFF';

export interface DayCell {
  day: number;
  weekday: number;
  shift: ShiftCode;
  workScheduleDetailId?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  code: string;
  avatar: string | null;
  departmentName: string;
  departments: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
}

export interface EmployeeRow {
  employee: Employee;
  schedule: DayCell[];
  summary: Summary;
}

export interface ShiftRun {
  shift: ShiftCode;
  startIndex: number;
  span: number;
  workScheduleDetailId?: string;
}

export type HourlyPayrollDay = {
  date: string;
  hours: number | null;
  shiftCode: string; // "CA1", "CA2", "OFF",...
  standardHours: number; // thường 8
  checkInTime: string | null; // "08:05" hoặc null nếu nghỉ
  checkOutTime: string | null;
  lateMinutes: number; // phút đi muộn
  earlyLeaveMinutes: number; // phút về sớm
  workUnits: number; // ngày công (1, 0.5, 0, ...)
  totalHours: number | null; // tổng giờ thực tế
  overtimeHours: number; // giờ tăng ca
  compensatoryHours: number;
};

export type HourlyPayrollWeek = {
  weekNumber: number;
  from: string;
  to: string;
  days: HourlyPayrollDay[];
};

export type HourlyPayrollRecord = {
  staffCode: string;
  staffName: string;
  staffId: string;
  standardHours: number;
  totalHours: number;
  days: HourlyPayrollDay[];
};

export type FlatRow =
  | {
      type: 'group';
      key: string;
      staff: IStaff;
      index: number;
      isExpanded: boolean;
    }
  | {
      type: 'shift';
      key: string;
      staffId: string;
      shift: DailyAttendance;
      isLast: boolean;
    };
