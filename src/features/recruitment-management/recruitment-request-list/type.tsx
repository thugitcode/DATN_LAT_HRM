export interface RecruitmentRequestFilters {
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
  status?: string;

  [key: string]: unknown;
}

export interface RecruitmentRequest {
  id: string;
  code: string;
  departmentId: string;
  departmentName: string;
  roomId: string;
  roomName: string;
  position: string;
  quantity: number;
  salaryRange: string;
  requiredDate: string;
  status: RecruitmentRequestStatusEnum;
  workType: string;
  candidateCount: number;
  interviewCount: number;
  createdById: string;
  createdByName: string;
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum RecruitmentRequestStatusEnum {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  RECRUITING = 'RECRUITING',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

export interface MetadataRecruitmentRequest {
  totalAll: number;
  totalRecruiting: number;
  totalPending: number;
  totalRejected: number;
  totalApproved: number;
  totalCancelled: number;
  totalPaused: number;
  totalClosed: number;
  [key: string]: unknown;
}

export interface ApproveRecruitmentRequestPayload {
  approvedById?: string;
}

export interface RejectRecruitmentRequestPayload {
  approvedById: string;
  rejectedReason: string;
}
