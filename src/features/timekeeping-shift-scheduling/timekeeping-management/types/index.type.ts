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
  OnTime = 'D',
  Absent = 'VM',
  Late = 'M',
  EarlyLeave = 'S',
  Overtime = 'CT',
  WorkFromHome = 'WFH',
  ShortHours = 'TG',
  MissingPunch = 'QCC',
  DayOff = 'N',
}

export enum HourlyPayrollStatus {
  FULL_HOURS = 'FULL_HOURS', // ĐỦ
  SHORTAGE = 'SHORTAGE', // Thiếu
  OVERTIME = 'OVERTIME', // Thừa
  OFF = 'OFF', // Nghỉ
}

export enum DetailedTimeSheetStatus {
  M = 'M', // Đi muộn
  S = 'S', // Về sớm
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
  weekday: string;
  shift: ShiftCode;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
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
