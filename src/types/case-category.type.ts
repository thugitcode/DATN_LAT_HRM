import type { Status } from './global.type';
import type { ShiftType } from './shift-management.type';

export enum CompensatoryTypeEnum {
  SHIFT = 'SHIFT', // Ca bù
  HOUR = 'HOUR', // Giờ bù
}

export interface CaseCategory {
  id: string;
  code: string;
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  coefficient: number;
  standardHours: number;
  color: string | null;
  allowedLateMinutes: number;
  allowedEarlyLeaveMinutes: number;
  handoverTime: number;
  dutyAllowance: number;
  compensatoryType: CompensatoryTypeEnum;
  compensatoryCoefficient: string;
  restTimeAfterShift: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}
