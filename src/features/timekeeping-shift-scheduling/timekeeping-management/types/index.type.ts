import type { ShiftTypeEnum } from '@/types/shift-management.type';

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

export enum DetailedTimeSheetStatus {
  M = 'M',
  S = 'S',
}

export interface LegendItem {
  status: AttendanceStatus | HourlyPayrollStatus | DetailedTimeSheetStatus | ShiftTypeEnum | null;
  label: string;
  color: string;
  shape?: 'circle' | 'ring' | 'line';
}

export type ShiftCode = `${AttendanceStatus}` | 'OFF';

export interface DayCell {
  day: number;
  weekday: number;
  shift: ShiftCode;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  code: string;
  avatar: string | null;
  departmentName: string;
}

export interface EmployeeRow {
  employee: Employee;
  schedule: DayCell[];
}

export interface ShiftRun {
  shift: ShiftCode;
  startIndex: number;
  span: number;
}

export type HourlyPayrollDay = {
  date: string;
  hours: number | null;
  shiftCode: string;           // "CA1", "CA2", "OFF",...
  standardHours: number;       // thường 8
  checkInTime: string | null;  // "08:05" hoặc null nếu nghỉ
  checkOutTime: string | null;
  lateMinutes: number;         // phút đi muộn
  earlyLeaveMinutes: number;   // phút về sớm
  workUnits: number;           // ngày công (1, 0.5, 0, ...)
  totalHours: number | null;   // tổng giờ thực tế
  overtimeHours: number;       // giờ tăng ca
  compensatoryHours: number;
};

export type HourlyPayrollWeek = {
  weekNumber: number;
  from: string;
  to: string;
  days: HourlyPayrollDay[];
};

export type HourlyPayrollRecord = {
  id: string;
  department: string;
  room: string;
  staffCode: string;
  staffName: string;
  position: string;
  weeks: HourlyPayrollWeek[];
};
