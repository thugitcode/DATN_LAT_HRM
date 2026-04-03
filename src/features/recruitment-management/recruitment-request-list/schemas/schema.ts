import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import { normalizeString, requiredString } from '@/features/staff-management/staff-list-management/schemas/staff.schema';

const numberField = (message: string) =>
  z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number({
      error: message,
    }).min(0, message)
  );

export const recruitmentRequestSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) =>
  z.object({
    code: z.string().nullable().optional(),
    createdAt: z.preprocess(normalizeString, z.string()).optional(),
    departmentId: requiredString(t('form.validation.department_required')),
    roomId: requiredString(t('form.validation.room_required')),
    position: requiredString(t('form.validation.position_required')),
    staffType: requiredString(t('form.validation.staff_type_required')),
    workType: requiredString(t('form.validation.work_type_required')),
    quantity: z.coerce.number().min(1, t('form.validation.quantity_required')),
    requiredDate: z.preprocess(normalizeString, z.string()).optional(),
    reason: z.preprocess(normalizeString, z.string()).optional(),
    description: requiredString(t('form.validation.description_required')),
    educationLevel: requiredString(t('form.validation.education_level_required')),
    requiredCertificates: requiredString(t('form.validation.certificates_required')),
    experienceYears: z.coerce.number().min(0, t('form.validation.experience_years_required')),
    technicalSkills: z.preprocess(normalizeString, z.string()).optional(),
    softSkills: z.preprocess(normalizeString, z.string()).optional(),
    otherRequirements: z.preprocess(normalizeString, z.string()).optional(),
    salaryFrom: numberField(t('form.validation.salary_from_required')),
    salaryTo: numberField(t('form.validation.salary_to_required')),
    note: z.preprocess(normalizeString, z.string()).optional(),
  });

export type RecruitmentRequestFormValues = z.infer<ReturnType<typeof recruitmentRequestSchema>>;

export const DEFAULT_VALUES: RecruitmentRequestFormValues = {
  code: null,
  createdAt: dayjs().format("YYYY-MM-DD"),
  departmentId: '',
  roomId: '',
  position: '',
  staffType: '',
  workType: '',
  quantity: 1,
  requiredDate: undefined,
  reason: '',
  description: '',
  educationLevel: '',
  requiredCertificates: '',
  experienceYears: 0,
  technicalSkills: '',
  softSkills: '',
  otherRequirements: '',
  salaryFrom: '' as unknown as number,
  salaryTo: '' as unknown as number,
  note: '',
};
