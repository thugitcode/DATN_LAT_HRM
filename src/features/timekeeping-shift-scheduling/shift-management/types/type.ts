import type { StaffPosition } from '@/types/global.type';
import type { ShiftTypeEnum } from '@/types/shift-management.type';

export interface DayColumn {
  day: number;
  dayOfWeek: number;
  date: string;
}

export interface ShiftCell {
  code: string;
  time: string;
  type?: ShiftTypeEnum;
  name?: string;
}

export interface StaffRow {
  id: string;
  name: string;
  role: StaffPosition;
  code: string;
  department?: string;
  avatar?: string;
  scheduleRows: Array<Array<ShiftCell | null>>;
}
