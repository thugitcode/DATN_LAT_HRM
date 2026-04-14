import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import { normalizeString, requiredString } from '@/features/staff-management/staff-list-management/schemas/staff.schema';
import { optionalString } from '../../candidate/schemas/candidate.schema';

const numberField = (message: string) =>
  z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number({
      error: message,
    }).min(0, message)
  );

export const recruitmentRequestSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) =>
  z.object({
    id: z.string().nullable().optional(),
    code: z.string().nullable().optional(),
    createdAt: z.preprocess(normalizeString, z.string()).optional(),
    departmentId: requiredString(t('form.validation.department_required')),
    roomId: optionalString(),
    // position: requiredString(t('form.validation.position_required')),
    jobTitleId: requiredString(t('form.validation.job_title_required')),
    staffType: requiredString(t('form.validation.staff_type_required')),
    workType: requiredString(t('form.validation.work_type_required')),
    quantity: z.coerce.number().min(1, t('form.validation.quantity_required')),
    requiredDate: z.preprocess(normalizeString, z.string()).optional(),
    reason: z.preprocess(normalizeString, z.string()).optional(),
    description: requiredString(t('form.validation.description_required')),
    educationLevel: requiredString(t('form.validation.education_level_required')),
    requiredCertificates: requiredString(t('form.validation.certificates_required')),
    experienceYears: requiredString(t('form.validation.experience_years_required')),
    technicalSkills: z.preprocess(normalizeString, z.string()).optional(),
    softSkills: z.preprocess(normalizeString, z.string()).optional(),
    otherRequirements: z.preprocess(normalizeString, z.string()).optional(),
    salaryFrom: numberField(t('form.validation.salary_from_required')),
    salaryTo: numberField(t('form.validation.salary_to_required')),
    note: z.preprocess(normalizeString, z.string()).optional(),
  }).refine((data) => {
    const from = data.salaryFrom ? Number(data.salaryFrom) : 0;
    const to = data.salaryTo ? Number(data.salaryTo) : Infinity;

    if (from > 0 && to !== Infinity) {
      return to >= from;
    }
    return true;
  }, {
    message: t('candidate.validation.salary_invalid'),
    path: ['salaryTo'],
  })

export type RecruitmentRequestFormValues = z.infer<ReturnType<typeof recruitmentRequestSchema>>;

export const DEFAULT_VALUES: RecruitmentRequestFormValues = {
  code: null,
  createdAt: dayjs().format("YYYY-MM-DD"),
  departmentId: '',
  roomId: '',
  // position: '',
  jobTitleId: '',
  staffType: '',
  workType: '',
  quantity: 1,
  requiredDate: undefined,
  reason: '',
  description: '',
  educationLevel: '',
  requiredCertificates: '',
  experienceYears: '',
  technicalSkills: '',
  softSkills: '',
  otherRequirements: '',
  salaryFrom: '' as unknown as number,
  salaryTo: '' as unknown as number,
  note: '',
};
