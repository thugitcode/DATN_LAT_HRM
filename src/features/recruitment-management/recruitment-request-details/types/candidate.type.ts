import type { PaginationParams } from '@/types';
import type { CandidateSourceEnum } from '../../types/candidate.type';
import type { AcademicTitleEnum, WorkingTypeTypeEnum } from '@/types/staff.type';
import type { EducationLevelEnum, ExperienceYearsEnum } from '../../constants/constants';

export enum CandidateStatusEnum {
  APPLIED = 'APPLIED',
  SCREENED = 'SCREENED',
  WAITING_INTERVIEW = 'WAITING_INTERVIEW',
  INTERVIEWING = 'INTERVIEWING',
  WAITING_OFFER = 'WAITING_OFFER',
  PROBATION_PROPOSED = 'PROBATION_PROPOSED',
  ON_PROBATION = 'ON_PROBATION',
  REJECTED = 'REJECTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
}

export interface CandidateRecruitmentRequest {
  id: string;
  code: string;
  position: string;
  staffType: string;
  workType: WorkingTypeTypeEnum;
  salaryFrom: string;
  salaryTo: string;
  department: { id: string; name: string };
  room: { id: string; name: string };
}

export interface CandidateDocument {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CandidateReviewer {
  id: string;
  name: string;
}

export interface ICandidate {
  id: string;
  code: string;
  name: string;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  identityCard: string | null;
  address: string | null;
  status: CandidateStatusEnum;
  source: CandidateSourceEnum;
  position?: string;
  departmentName?: string;
  roomName?: string;
  recruitmentRequest: CandidateRecruitmentRequest | null;
  expectedSalaryFrom: string | null;
  expectedSalaryTo: string | null;
  practiceNumber: string | null;
  practiceIssueDate: string | null;
  practiceIssuePlace: string | null;
  practiceScope: string | null;
  practiceFileUrl: string | null;
  school: string | null;
  major: string | null;
  educationLevel: EducationLevelEnum;
  academicTitle: AcademicTitleEnum;
  experienceYears: ExperienceYearsEnum;
  note: string | null;
  reviewer: CandidateReviewer | null;
  interviewDate: string | null;
  interviewComment: string | null;
  professionalScore: string | null;
  attitudeScore: string | null;
  communicationScore: string | null;
  experienceScore: string | null;
  professionalEvaluation: string | null;
  attitudeEvaluation: string | null;
  communicationEvaluation: string | null;
  experienceEvaluation: string | null;
  professionalComment: string | null;
  attitudeComment: string | null;
  communicationComment: string | null;
  experienceComment: string | null;
  documents: CandidateDocument[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CandidateFilters extends Partial<PaginationParams> {
  status?: CandidateStatusEnum;
  source?: CandidateSourceEnum;
  recruitmentRequestId?: string;
  [key: string]: unknown;
}

export enum OfferLetterStatusEnum {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export interface OfferLetterDocument {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export interface OfferLetter {
  id: string;
  candidateId: string;
  status: OfferLetterStatusEnum;
  position: string;
  departmentName: string;
  roomName: string;
  basicSalary: string;
  allowance: string | null;
  medicalAllowance: string | null;
  totalIncome: string;
  startDate: string;
  probationMonths: number;
  probationSalaryRate: number;
  approverName: string | null;
  document: OfferLetterDocument | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfferLetterFilters extends Partial<PaginationParams> {
  candidateId?: string;
  [key: string]: unknown;
}
export interface ICreateOfferLetterPayload {
  offerPosition: string;
  offerDepartment: string;
  baseSalary: number;
  allowance: number;
  specialAllowance: number;
  offerStartDate: string;
  probationMonths: number;
  offerApproverId: string;
  offerDocumentUrl: string | null;
  offerNotes: string | null;
  send: boolean
}
export interface OfferLetterPayload {
  candidateId: string;
  position: string;
  departmentName: string;
  roomName: string;
  basicSalary: string;
  allowance?: string | null;
  medicalAllowance?: string | null;
  startDate: string;
  probationMonths: number;
  probationSalaryRate: number;
  approverName?: string | null;
}

export interface CandidatePayload {
  status?: CandidateStatusEnum;
  name: string;
  dateOfBirth?: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  identityCard?: string | null;
  address?: string | null;
  departmentId: string;
  roomId?: string | null;
  recruitmentRequestId: string;
  staffType: string;
  expectedSalaryFrom?: string | null;
  expectedSalaryTo?: string | null;
  source?: string | null;
  school?: string | null;
  major?: string | null;
  educationLevel?: string | null;
  academicTitle?: string | null;
  experienceYears?: string | null;
  note?: string | null;
  practiceNumber?: string | null;
  practiceIssueDate?: string | null;
  practiceIssuePlace?: string | null;
  practiceScope?: string | null;
  practiceFileUrl?: string;
  documents?: CandidateDocument[];
}

export type CandidateStatusLabelKey =
  | 'candidate.status.applied'
  | 'candidate.status.screened'
  | 'candidate.status.waiting_interview'
  | 'candidate.status.interviewing'
  | 'candidate.status.waiting_offer'
  | 'candidate.status.probation_proposed'
  | 'candidate.status.on_probation'
  | 'candidate.status.rejected'
  | 'candidate.status.offer_declined';

export interface KanbanColumn {
  status: CandidateStatusEnum;
  labelKey: CandidateStatusLabelKey;
  color: string;
  bgColor: string;
}