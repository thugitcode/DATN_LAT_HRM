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

export interface CandidateFilters {
  status?: CandidateStatusEnum;
  recruitmentRequestId?: string
  [key: string]: unknown;
}
