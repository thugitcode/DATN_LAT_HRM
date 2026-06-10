import type { Status } from '@/types/global.type';

export interface TrainingRegistrantion {
  id: string;
  code: string;
  courseName: string;
  trainingCenter: string;
  cost: number;
  fromDate: string;
  toDate: string;
  note: string;
  status: Status;
  staffId: string;
  staffName: string;
  staffCode: string;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
}
