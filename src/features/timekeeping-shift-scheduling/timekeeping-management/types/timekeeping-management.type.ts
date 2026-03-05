import type { StaffPosition } from '@/types/global.type';

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
}

export interface ShiftEntry {
  shift: ShiftTimeKeeping;
  days: Record<string, WorkDay>;
  summary: Summary;
}

export interface WorkSheetByShiftType {
  staff: StaffTimeKeeping;
  shifts: ShiftEntry[];
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
  status: 'OFF' | 'FULL' | 'OVERTIME' | 'MISSING';
}
