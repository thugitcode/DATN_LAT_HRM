import type { Status } from '@/types/global.type';

export interface RemoteWork {
  id: string;
  code: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  location: string;
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
