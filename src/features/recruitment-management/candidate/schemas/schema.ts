import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { NAMESPACES } from '@/i18n/constants';

export const normalizeString = (v: unknown) => (v === null || v === undefined ? '' : String(v));

export const requiredString = (message: string) =>
  z.preprocess(normalizeString, z.string().min(1, message));

export const optionalString = () => z.preprocess(normalizeString, z.string());

export const candidateSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) =>
  z.object({
    // Thông tin cá nhân
    name: requiredString(t('candidate.validation.name_required')),
    dateOfBirth: optionalString().nullable(),
    gender: z.preprocess(
      (v) => (v === null || v === undefined || v === '' ? undefined : String(v)),
      z.enum(['MALE', 'FEMALE', 'OTHER'] as const, {
        error: t('candidate.validation.gender_required') as string,
      }),
    ),
    phone: requiredString(t('candidate.validation.phone_required')),
    email: z.preprocess(normalizeString, z.string().email(t('candidate.validation.email_invalid'))),
    identityCard: optionalString().nullable(),
    address: optionalString().nullable(),
    // Ứng tuyển
    departmentId: requiredString(t('candidate.validation.department_required')),
    roomId: optionalString().nullable(),
    recruitmentRequestId: requiredString(t('candidate.validation.position_required')),
    staffType: requiredString(t('candidate.validation.work_type_required')),
    expectedSalaryFrom: optionalString().nullable(),
    expectedSalaryTo: optionalString().nullable(),
    source: optionalString().nullable(),
    // Trình độ & CCHN
    school: optionalString().nullable(),
    major: optionalString().nullable(),
    educationLevel: optionalString().nullable(),
    academicTitle: optionalString().nullable(),
    experienceYears: optionalString().nullable(),
    note: optionalString().nullable(),
    practiceNumber: optionalString().nullable(),
    practiceIssueDate: optionalString().nullable(),
    practiceIssuePlace: optionalString().nullable(),
    practiceScope: optionalString().nullable(),
    practiceFileUrl: z.any().optional(),
    // Hồ sơ đi kèm
    documents: z.any().optional(),
  });

export type CandidateFormValues = z.infer<ReturnType<typeof candidateSchema>>;

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
