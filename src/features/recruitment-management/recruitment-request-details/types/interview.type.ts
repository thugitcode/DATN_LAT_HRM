import type { PaginationParams } from '@/types';
import type { Staff } from '@/types/staff.type';
import type { ICandidate } from './candidate.type';

export enum InterviewMethodEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum InterviewStatusEnum {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  // PENDING_EVALUATION = 'PENDING_EVALUATION',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
}

export interface InterviewSchedule {
  id: string;
  code: string;
  content: string;
  interviewMethod: InterviewMethodEnum;
  interviewDate: string;
  startTime: string;
  endTime: string;
  status: InterviewStatusEnum;
  candidateName: string;
  source: string;
  interviewerName: string;
  interviewerAvatar: string;
  position: string;
  departmentName: string;
  roomName: string;
  address: string;
  onlineLink: string;
  createdAt: string;
  interviewer: Staff
  candidate: ICandidate
  candidateId: string
}

export interface InterviewScheduleFilters extends Partial<PaginationParams> {
  candidateId?: string;
  recruitmentRequestId?: string;
  [key: string]: unknown;
}
