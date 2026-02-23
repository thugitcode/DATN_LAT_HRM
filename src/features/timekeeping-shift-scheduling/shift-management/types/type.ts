import type { StaffPosition } from '@/types/global.type';

export enum ShiftTypeEnum {
  FIXED = 'FIXED', // Ca cố định
  FLEXIBLE = 'FLEXIBLE', // Ca linh hoạt
  ON_DUTY = 'ON_DUTY', // Ca trực
  SPLIT = 'SPLIT', // Ca gãy
}

export interface DayColumn {
  day: number;
  dayOfWeek: number;
}

export type ShiftType = 'main' | 'alternate' | 'direct' | 'flexible' | 'off';

export interface ShiftCell {
  code: string;
  time: string;
  type: ShiftType;
  name?: string;
}

export interface StaffRow {
  id: string;
  name: string;
  role: StaffPosition;
  code: string;
  department: string;
  avatar?: string;
  scheduleRows: Array<Array<ShiftCell | null>>;
}
