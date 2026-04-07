import { icons } from '@/lib/icons';

import type { MetadataRecruitmentRequest } from '../recruitment-request-list/types/type';
import type { CandidateFormValues } from '../candidate/schemas/schema';

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
  positionId: '',
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
