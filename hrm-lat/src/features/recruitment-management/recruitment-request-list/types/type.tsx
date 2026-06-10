import type { Department } from "@/types/deparment.type";
import type { Room } from "@/types/room.type";
import type { Staff, StaffJobTitleEnum, StaffTypeEnum, WorkingTypeEnum } from "@/types/staff.type";

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

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  createdByStaff: Staff;
  approvedByStaff: Staff | null;

  department: Department;
  jobTitle: { id: string, name: string, code: string };

  description: string;
  educationLevel: string;
  experienceYears: string;

  note: string | null;
  otherRequirements: string;
  softSkills: string;
  technicalSkills: string;

  position: string | null;
  quantity: number;

  reason: string;
  rejectionReason: string | null;

  requestDate: string;   // yyyy-MM-dd
  requiredDate: string;  // yyyy-MM-dd

  requiredCertificates: string;

  room: Room;

  salaryFrom: number;
  salaryTo: number;

  staffType: StaffTypeEnum;
  workType: WorkingTypeEnum;

  status: RecruitmentRequestStatusEnum;
  candidateCount: number;
  waitingInterviewCount: number;
  createdByStaffName: string
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

export interface IRecruitmentRequestMutatePayload {
  code?: string | null;
  departmentId?: string;
  roomId?: string;
  position?: string;
  jobTitleId?: string;
  staffType?: StaffTypeEnum;
  workType?: WorkingTypeEnum;
  quantity?: number;
  requiredDate?: string;
  reason?: string;
  description?: string;
  educationLevel?: string;
  requiredCertificates?: string;
  experienceYears?: string;
  technicalSkills?: string;
  softSkills?: string;
  otherRequirements?: string;
  salaryFrom?: number;
  salaryTo?: number;
  note?: string;
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