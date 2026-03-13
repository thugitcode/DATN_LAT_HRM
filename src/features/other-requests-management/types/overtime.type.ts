import type { Status } from '@/types/global.type';

export interface OverTime {
  id: string;
  code: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  reason: string;
  status: Status;
  staffId: string;
  staffName: string;
  staffCode: string;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
}
