import type { RequestStatusEnum } from '@/types/attendance-explanation.type';
import type { Status } from '@/types/global.type';
import type { StaffPositionEnum } from '@/types/staff.type';

export interface LeaveRequestManagementFilters {
  fromDate?: string;
  toDate?: string;
  departmentId?: string;
  roomId?: string;
  search?: string;
  page?: string;
  limit?: string;
  month?: string;
  departmentIds?: string;
  roomIds?: string;

  [key: string]: unknown;
}

export interface LeaveRequest {
  id: string;
  code: string;
  staffId: string;
  staffName: string;
  staffCode: string;
  staffPosition: StaffPositionEnum;
  departments: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
  leaveReasonId: string;
  leaveReasonName: string;
  fromDate: string;
  toDate: string;
  totalDays: string;
  reason: string;
  attachments: unknown[];
  replacementStaffId: string;
  replacementStaffName: string;
  status: RequestStatusEnum;
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  startTime: string | null;
  endTime: string | null;
}

export interface MetadataLeaveRequest {
  totalAll: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalCancelled: number;
}

export interface ApproveLeaveRequestPayload {
  approvedById?: string;
}

export interface RejectLeaveRequestPayload {
  approvedById: string;
  rejectedReason: string;
}
