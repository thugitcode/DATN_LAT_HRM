import type { PaginationParams } from '@/types';
import type { CandidateSourceEnum } from '../../types/candidate.type';

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

export interface Candidate {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  status: CandidateStatusEnum;
  source: string;
  position: string;
  departmentName: string;
  roomName: string;
  createdAt: string;
}

export interface CandidateFilters extends Partial<PaginationParams> {
  status?: CandidateStatusEnum;
  source?: CandidateSourceEnum;
  recruitmentRequestId?: string;
  [key: string]: unknown;
}

export interface CandidateDocument {
  fileUrl: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface CandidatePayload {
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
