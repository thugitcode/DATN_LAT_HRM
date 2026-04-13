import { requiredEmail } from '@/features/staff-management/staff-list-management/schemas/staff.schema';
import type { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { z } from 'zod';

export const normalizeString = (v: unknown) => (v === null || v === undefined ? '' : String(v));

export const requiredString = (message: string) =>
  z.preprocess(normalizeString, z.string().min(1, message));

export const optionalString = () => z.preprocess(normalizeString, z.string());

export const candidateSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) => {
  const practiceIssueDateSchema = optionalString()
    .nullable()
    .refine((value) => {
      if (!value) return true; // cho phép null/undefined

      const inputDate = dayjs(value);
      const today = dayjs().endOf('day'); // lấy hết hôm nay

      return inputDate.isValid() && inputDate.isBefore(today);
    }, {
      message: t("candidate.validation.max_practice_issue_date"),
    });
  return z.object({
    // Thông tin cá nhân
    name: requiredString(t('candidate.validation.name_required')),
    dateOfBirth: optionalString().refine((val) => new Date(val) < new Date(), t("candidate.validation.birthday_underage"))
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();

        let age = now.getFullYear() - date.getFullYear();
        const m = now.getMonth() - date.getMonth();

        if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;

        return age >= 18;
      }).nullable(),
    gender: z.preprocess(
      (v) => (v === null || v === undefined || v === '' ? undefined : String(v)),
      z.enum(['MALE', 'FEMALE', 'OTHER'] as const, {
        error: t('candidate.validation.gender_required') as string,
      }),
    ),
    phone: requiredString(t("candidate.validation.phone_required")).refine(
      (val) => /^\d{10}$/.test(val),
      t("candidate.validation.phone_format"),
    ),

    email: requiredEmail(
      t("candidate.validation.email_required"),
      t("candidate.validation.email_format")
    ),
    identityCard: optionalString().nullable(),
    address: optionalString().nullable(),
    // Ứng tuyển
    departmentId: optionalString().nullable(),
    roomId: optionalString().nullable(),
    recruitmentRequestId: requiredString(t('candidate.validation.position_required')),
    workType: optionalString().nullable(),
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
    practiceIssueDate: practiceIssueDateSchema,
    practiceIssuePlace: optionalString().nullable(),
    practiceScope: optionalString().nullable(),
    practiceFileUrl: z.any().optional(),
    // Hồ sơ đi kèm
    documents: z.any().optional(),
  }).refine((data) => {
    const from = data.expectedSalaryFrom ? Number(data.expectedSalaryFrom) : 0;
    const to = data.expectedSalaryTo ? Number(data.expectedSalaryTo) : Infinity;

    if (from > 0 && to !== Infinity) {
      return to >= from;
    }
    return true;
  }, {
    message: t('candidate.validation.salary_invalid'),
    path: ['expectedSalaryTo'],
  })
};

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
