import { icons } from '@/lib/icons';

import type { MetadataRecruitmentRequest } from '../recruitment-request-list/types/type';
import type { CandidateFormValues } from '../candidate/schemas/candidate.schema';
import { CandidateStatusEnum, MainNavigateEnum, type CandidateRowActionConfig, type ICandidate } from '../recruitment-request-details/types/candidate.type';
import { IconCalendarPlus, IconCalendarSearch, IconCalendarX, IconEye, IconFileText, IconRefresh, IconSend, IconUserCheck, IconUserX } from '@tabler/icons-react';
import { DrawerType } from '@/store/useDrawer';

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
  workType: '',
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
  { label: CandidateStatusLabel; color: 'primary' | 'secondary' | 'warning' | 'success' | 'danger' | 'default', bg?: string, text?: string }
> = {
  [CandidateStatusEnum.APPLIED]: { label: 'candidate.status.applied', color: 'default', bg: 'bg-default', text: 'text-black' },
  [CandidateStatusEnum.SCREENED]: { label: 'candidate.status.screened', color: 'secondary', bg: 'bg-[#F4EEFF]', text: 'text-[#7828C8]' },
  [CandidateStatusEnum.WAITING_INTERVIEW]: { label: 'candidate.status.waiting_interview', color: 'warning', bg: 'bg-[#FEF3CD]', text: 'text-[#C4841D]' },
  [CandidateStatusEnum.INTERVIEWING]: { label: 'candidate.status.interviewing', color: 'primary', bg: 'bg-[#006FEE33]', text: 'text-primary' },
  [CandidateStatusEnum.WAITING_OFFER]: { label: 'candidate.status.waiting_offer', color: 'default', bg: 'bg-cyan-100', text: 'text-cyan-600' },
  [CandidateStatusEnum.PROBATION_PROPOSED]: { label: 'candidate.status.probation_proposed', color: 'danger', bg: 'bg-[#FFEDFA]', text: 'text-[#FF4ECD]' },
  [CandidateStatusEnum.ON_PROBATION]: { label: 'candidate.status.on_probation', color: 'success', bg: 'bg-[#17C96433]', text: 'text-success' },
  [CandidateStatusEnum.REJECTED]: { label: 'candidate.status.rejected', color: 'danger', bg: 'bg-[#FEE7EF]', text: 'text-[#F31260]' },
  [CandidateStatusEnum.OFFER_DECLINED]: { label: 'candidate.status.offer_declined', color: 'danger', bg: 'bg-[#FEE7EF]', text: 'text-[#F31260]' },
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

export const CANDIDATE_ROW_ACTION_CONFIG: Partial<Record<CandidateStatusEnum, CandidateRowActionConfig>> = {
  [CandidateStatusEnum.APPLIED]: {
    mainLabelKey: 'candidate.actions.screen',
    mainIcon: <IconUserCheck size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainStatusTo: CandidateStatusEnum.SCREENED,
    secondary: [
      { key: 'view_detail', labelKey: 'candidate.actions.view_detail', icon: <IconEye size={14} />, navigate: 'detail' },
      { key: 'reject', labelKey: 'candidate.actions.reject', icon: <IconUserX size={14} />, color: 'danger', statusTo: CandidateStatusEnum.REJECTED },
    ],
  },
  [CandidateStatusEnum.SCREENED]: {
    mainLabelKey: 'candidate.actions.schedule_interview',
    mainIcon: <IconCalendarPlus size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainDrawer: DrawerType.INTERVIEW_SCHEDULE_MUTATE,
    secondary: [
      { key: 'view_detail', labelKey: 'candidate.actions.view_detail', icon: <IconEye size={14} />, navigate: 'detail' },
      { key: 'reject', labelKey: 'candidate.actions.reject', icon: <IconUserX size={14} />, color: 'danger', statusTo: CandidateStatusEnum.REJECTED },
    ],
  },
  [CandidateStatusEnum.WAITING_INTERVIEW]: {
    mainLabelKey: 'candidate.actions.view_schedule',
    mainIcon: <IconCalendarSearch size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainNavigate: MainNavigateEnum.SCHEDULE,
    secondary: [
      { key: 'reschedule', labelKey: 'candidate.actions.reschedule', icon: <IconCalendarPlus size={14} />, drawer: DrawerType.INTERVIEW_SCHEDULE_MUTATE },
      { key: 'cancel_schedule', labelKey: 'candidate.actions.cancel_schedule', icon: <IconCalendarX size={14} />, color: 'danger' },
      { key: 'reject', labelKey: 'candidate.actions.reject', icon: <IconUserX size={14} />, color: 'danger', statusTo: CandidateStatusEnum.REJECTED },
    ],
  },
  [CandidateStatusEnum.INTERVIEWING]: {
    mainLabelKey: 'candidate.actions.evaluate',
    mainIcon: <IconFileText size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainDrawer: DrawerType.EVALUATION_MUTATE,
    secondary: [
      { key: 'reject', labelKey: 'candidate.actions.reject', icon: <IconUserX size={14} />, color: 'danger', statusTo: CandidateStatusEnum.REJECTED },
    ],
  },
  [CandidateStatusEnum.WAITING_OFFER]: {
    mainLabelKey: 'candidate.actions.send_offer',
    mainIcon: <IconSend size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainDrawer: DrawerType.OFFER_MUTATE,
    secondary: [
      { key: 'reject', labelKey: 'candidate.actions.reject', icon: <IconUserX size={14} />, color: 'danger', statusTo: CandidateStatusEnum.REJECTED },
    ],
  },
  [CandidateStatusEnum.PROBATION_PROPOSED]: {
    mainLabelKey: 'candidate.actions.create_probation_profile',
    mainIcon: <IconFileText size={14} />,
    mainVariant: 'solid',
    mainColor: 'primary',
    mainDrawer: DrawerType.CANDIDATE_PROBATION_CREATE,
    secondary: [],
  },
  [CandidateStatusEnum.ON_PROBATION]: {
    mainLabelKey: 'candidate.actions.accept_official',
    mainIcon: <IconUserCheck size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainStatusTo: CandidateStatusEnum.ON_PROBATION, // placeholder — replace with actual flow
    secondary: [
      { key: 'view_detail', labelKey: 'candidate.actions.view_detail', icon: <IconEye size={14} />, navigate: 'detail' },
    ],
  },
  [CandidateStatusEnum.REJECTED]: {
    mainLabelKey: 'candidate.actions.restore',
    mainIcon: <IconRefresh size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainStatusTo: CandidateStatusEnum.APPLIED,
    secondary: [
      { key: 'view_reason', labelKey: 'candidate.actions.view_reason', icon: <IconEye size={14} />, navigate: 'detail' },
    ],
  },
  [CandidateStatusEnum.OFFER_DECLINED]: {
    mainLabelKey: 'candidate.actions.view_reason',
    mainIcon: <IconEye size={14} />,
    mainVariant: 'bordered',
    mainColor: 'primary',
    mainNavigate: MainNavigateEnum.DETAIL,
    secondary: [],
  },
};