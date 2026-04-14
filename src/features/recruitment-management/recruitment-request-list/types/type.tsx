import type { Department } from "@/types/deparment.type";
import type { Room } from "@/types/room.type";
import type { WorkingTypeEnum } from "@/types/staff.type";

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
  department: Department;
  room: Room;
  roomId: string;
  roomName: string;
  position: string;
  jobTitleId?: string;
  jobTitle?: { id: string; name: string };
  quantity: number;
  salaryFrom: number;
  salaryTo: number;
  requiredDate: string;
  status: RecruitmentRequestStatusEnum;
  workType: WorkingTypeEnum;
  candidateCount: number;
  interviewCount: number;
  createdById: string;
  createdByStaffName: string;
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
  total: number;
  DRAFT: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  RECRUITING: number;
  PAUSED: number;
  CLOSED: number;
  CANCELLED: number;
  [key: string]: unknown;
}

export interface ApproveRecruitmentRequestPayload {
  approvedById?: string;
}

export interface RejectRecruitmentRequestPayload {
  rejectionReason: string;
}

export enum RecruitmentRequestActionEnum {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  CLOSE = 'close',
  OPEN_RECRUITING = 'openRecruiting',
  PAUSE = 'pause',
  RESUME = 'resume',
  CANCEL = 'cancel',
}

export type ActionPayload = {
  [RecruitmentRequestActionEnum.SUBMIT]: ApproveRecruitmentRequestPayload | undefined;
  [RecruitmentRequestActionEnum.APPROVE]: ApproveRecruitmentRequestPayload | undefined;
  [RecruitmentRequestActionEnum.REJECT]: RejectRecruitmentRequestPayload;
  [RecruitmentRequestActionEnum.CLOSE]: undefined;
  [RecruitmentRequestActionEnum.OPEN_RECRUITING]: undefined;
  [RecruitmentRequestActionEnum.PAUSE]: undefined;
  [RecruitmentRequestActionEnum.RESUME]: undefined;
  [RecruitmentRequestActionEnum.CANCEL]: undefined;
};