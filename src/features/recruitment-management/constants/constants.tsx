import { icons } from '@/lib/icons';

import type { MetadataRecruitmentRequest } from '../recruitment-request-list/types/type';
import type { CandidateFormValues } from '../candidate/schemas/schema';
import { CandidateStatusEnum, type ICandidate } from '../recruitment-request-details/types/type';

type SummaryKey = keyof MetadataRecruitmentRequest;

export const SUMMARY_BADGE_KEYS = [
  {
    key: 'total' satisfies SummaryKey,
    icon: icons.questionCircle,
    color: '#000000',
    bgColor: '#F2EAFA',
  },
  {
    key: 'RECRUITING' satisfies SummaryKey,
    icon: icons.questionCircle,
    color: '#6576FF',
    bgColor: '#E6F1FE',
  },
  {
    key: 'PENDING' satisfies SummaryKey,
    icon: <icons.refreshCircle />,
    color: '#F5A524',
    bgColor: '#FEFCE8',
  },
  {
    key: 'REJECTED' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    color: '#F31260',
    bgColor: '#FEE7EF',
  },
  {
    key: 'APPROVED' satisfies SummaryKey,
    icon: <icons.tickCircle />,
    color: '#17C964',
    bgColor: '#E8FAF0',
  },
  {
    key: 'CANCELLED' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    color: '#F31260',
    bgColor: '#FEFCE8',
  },
  {
    key: 'PAUSED' satisfies SummaryKey,
    icon: <icons.refreshCircle />,
    color: '#F5A524',
    bgColor: '#F2EAFA',
  },
  {
    key: 'CLOSED' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    color: '#000000',
    bgColor: '#F4F4F5',
  },
] as const;

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum EducationLevelEnum {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  COLLEGE = 'COLLEGE',
  UNIVERSITY = 'UNIVERSITY',
  MASTER = 'MASTER',
  DOCTOR = 'DOCTOR',
}

export enum AcademicTitleEnum {
  NONE = 'NONE',
  ASSOCIATE_PROFESSOR = 'ASSOCIATE_PROFESSOR',
  PROFESSOR = 'PROFESSOR',
}

export enum ExperienceYearsEnum {
  UNDER_1 = 'UNDER_1',
  FROM_1_TO_3 = 'FROM_1_TO_3',
  FROM_3_TO_5 = 'FROM_3_TO_5',
  FROM_5_TO_10 = 'FROM_5_TO_10',
  OVER_10 = 'OVER_10',
}

export const DEFAULT_VALUES: Partial<CandidateFormValues> = {
  name: '',
  dateOfBirth: null,
  gender: undefined,
  phone: '',
  email: '',
  identityCard: '',
  address: '',
  departmentId: '',
  roomId: null,
  recruitmentRequestId: '',
  staffType: '',
  expectedSalaryFrom: null,
  expectedSalaryTo: null,
  source: null,
  school: null,
  major: null,
  educationLevel: null,
  academicTitle: null,
  experienceYears: null,
  note: null,
  practiceNumber: null,
  practiceIssueDate: null,
  practiceIssuePlace: null,
  practiceScope: null,
  practiceFileUrl: undefined,
  documents: undefined,
};

type CandidateStatusLabel =
  | 'candidate.status.applied'
  | 'candidate.status.screened'
  | 'candidate.status.waiting_interview'
  | 'candidate.status.interviewing'
  | 'candidate.status.waiting_offer'
  | 'candidate.status.probation_proposed'
  | 'candidate.status.on_probation'
  | 'candidate.status.rejected'
  | 'candidate.status.offer_declined';

export const STATUS_CHIP: Record<
  CandidateStatusEnum,
  { label: CandidateStatusLabel; color: 'primary' | 'secondary' | 'warning' | 'success' | 'danger' | 'default' }
> = {
  [CandidateStatusEnum.APPLIED]: { label: 'candidate.status.applied', color: 'primary' },
  [CandidateStatusEnum.SCREENED]: { label: 'candidate.status.screened', color: 'secondary' },
  [CandidateStatusEnum.WAITING_INTERVIEW]: { label: 'candidate.status.waiting_interview', color: 'warning' },
  [CandidateStatusEnum.INTERVIEWING]: { label: 'candidate.status.interviewing', color: 'success' },
  [CandidateStatusEnum.WAITING_OFFER]: { label: 'candidate.status.waiting_offer', color: 'success' },
  [CandidateStatusEnum.PROBATION_PROPOSED]: { label: 'candidate.status.probation_proposed', color: 'primary' },
  [CandidateStatusEnum.ON_PROBATION]: { label: 'candidate.status.on_probation', color: 'default' },
  [CandidateStatusEnum.REJECTED]: { label: 'candidate.status.rejected', color: 'danger' },
  [CandidateStatusEnum.OFFER_DECLINED]: { label: 'candidate.status.offer_declined', color: 'danger' },
};

export const NEXT_STATUS: Partial<Record<CandidateStatusEnum, CandidateStatusEnum>> = {
  [CandidateStatusEnum.APPLIED]: CandidateStatusEnum.SCREENED,
  [CandidateStatusEnum.SCREENED]: CandidateStatusEnum.WAITING_INTERVIEW,
  [CandidateStatusEnum.WAITING_OFFER]: CandidateStatusEnum.PROBATION_PROPOSED,
  [CandidateStatusEnum.PROBATION_PROPOSED]: CandidateStatusEnum.ON_PROBATION,
};

export const ACTION_LABEL: Record<CandidateStatusEnum, string> = {
  [CandidateStatusEnum.APPLIED]: 'candidate.actions.screen',
  [CandidateStatusEnum.SCREENED]: 'candidate.actions.schedule_interview',
  [CandidateStatusEnum.WAITING_INTERVIEW]: 'candidate.actions.view_schedule',
  [CandidateStatusEnum.INTERVIEWING]: 'candidate.actions.view_schedule',
  [CandidateStatusEnum.WAITING_OFFER]: 'candidate.actions.send_offer',
  [CandidateStatusEnum.PROBATION_PROPOSED]: 'candidate.actions.send_offer',
  [CandidateStatusEnum.ON_PROBATION]: 'candidate.actions.accept_official',
  [CandidateStatusEnum.REJECTED]: 'candidate.actions.view_detail',
  [CandidateStatusEnum.OFFER_DECLINED]: 'candidate.actions.view_detail',
};

export const criteria = (candidate: ICandidate, t: any) => [
  {
    labelKey: t('candidate.detail.evaluation.professional_knowledge'),
    score: candidate.professionalScore,
    evaluation: candidate.professionalEvaluation,
    comment: candidate.professionalComment,
  },
  {
    labelKey: t('candidate.detail.evaluation.attitude'),
    score: candidate.attitudeScore,
    evaluation: candidate.attitudeEvaluation,
    comment: candidate.attitudeComment,
  },
  {
    labelKey: t('candidate.detail.evaluation.communication'),
    score: candidate.communicationScore,
    evaluation: candidate.communicationEvaluation,
    comment: candidate.communicationComment,
  },
  {
    labelKey: t('candidate.detail.evaluation.experience'),
    score: candidate.experienceScore,
    evaluation: candidate.experienceEvaluation,
    comment: candidate.experienceComment,
  },
];
