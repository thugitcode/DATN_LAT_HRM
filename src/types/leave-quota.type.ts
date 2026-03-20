import type { Status } from './global.type';

export interface LeaveQuota {
  id: string;
  code: string;
  name: string;
  quotaAmount: number;
  quotaUnit: string;
  maxQuota: number;
  maxQuotaUnit: string;
  allowCarryOver: boolean;
  carryOverExpireDate: string;
  carryOverPercent: number;
  description: string;
  status: Status;
  createdAt: string;
}
