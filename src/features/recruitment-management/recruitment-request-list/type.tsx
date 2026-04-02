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
  RECRUITING = 'RECRUITING',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
  INTERVIEWING = 'INTERVIEWING',
}

export interface MetadataRecruitmentRequest {
  totalAll: number;
  totalRecruiting: number;
  totalPending: number;
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
