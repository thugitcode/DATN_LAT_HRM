import type { Status } from '@/types/global.type';

export type RequestType = 'EQUIPMENT';

export interface BusinessTrip {
  id: string;
  code: string;
  type: RequestType;
  title: string;
  content: string;
  status: Status;
  staffId: string;
  staffName: string;
  staffCode: string;
  approvedByName: string;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
}
