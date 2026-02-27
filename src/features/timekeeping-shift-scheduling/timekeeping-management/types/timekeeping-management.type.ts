import type { Department } from "@/types/deparment.type";
import type { StaffPosition } from "@/types/global.type";
import type { Room } from "@/types/room.type";

export interface WorkDay {
  workScheduleDetailId: string;
  date: string; // format: YYYY-MM-DD
  displayCode: string;
  shiftStartTime: string; // HH:mm:ss
  shiftEndTime: string; // HH:mm:ss
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string; // có thể enum nếu cần
  workWeight: number;
}

export interface ShiftTimeKeeping {
  id: string;
  code: string;
  name: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
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

export interface WorkSheetByShiftType {
  days: Record<string, WorkDay>; // key dạng "YYYY-MM-DD"
  shift: ShiftTimeKeeping;
  staff: StaffTimeKeeping;
  summary: Summary;
}


export interface AttendanceByHoursResponse {
  departments: Department[];
  rooms: Room[];
  position: StaffPosition
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