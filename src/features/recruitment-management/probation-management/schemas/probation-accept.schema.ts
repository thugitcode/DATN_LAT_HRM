import { z } from 'zod';
import { normalizeString, requiredString, optionalString } from '@/features/recruitment-management/candidate/schemas/candidate.schema';

export const probationAcceptSchema = (t: (key: string) => string) =>
  z.object({
    officialStartDate: requiredString(t('probation.form.validation.start_date_required')),
    departmentId: requiredString(t('probation.form.validation.department_required')),
    contractType: requiredString(t('probation.form.validation.contract_type_required')),
    basicSalary: z.number().nullable().optional(),
    email: optionalString(),
    systemPermissions: optionalString(),
    onboardingDocumentsCompleted: z.boolean().default(false),
    onboardingContractSigned: z.boolean().default(false),
    onboardingSystemAccountCreated: z.boolean().default(false),
    onboardingStaffCardIssued: z.boolean().default(false),
    onboardingUniformIssued: z.boolean().default(false),
    onboardingOrientationCompleted: z.boolean().default(false),
  });

export type ProbationAcceptFormValues = z.infer<
  ReturnType<typeof probationAcceptSchema>
>;

export const PROBATION_ACCEPT_DEFAULT_VALUES: ProbationAcceptFormValues = {
  officialStartDate: '',
  departmentId: '',
  contractType: '',
  basicSalary: null,
  email: '',
  systemPermissions: '',
  onboardingDocumentsCompleted: false,
  onboardingContractSigned: false,
  onboardingSystemAccountCreated: false,
  onboardingStaffCardIssued: false,
  onboardingUniformIssued: false,
  onboardingOrientationCompleted: false,
};
