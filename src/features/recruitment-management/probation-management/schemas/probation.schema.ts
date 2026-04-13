import dayjs from 'dayjs';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { NAMESPACES } from '@/i18n/constants';
import { optionalString, requiredString } from '../../candidate/schemas/candidate.schema';

export const probationCreateSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) =>
    z.object({
        // Section 1: Thông tin nhân sự thử việc
        name: requiredString(t('probation.form.validation.name_required')),
        phone: requiredString(t('probation.form.validation.phone_required')).refine(
            (val) => /^\d{10}$/.test(val),
            t('probation.form.validation.phone_format'),
        ),
        email: requiredString(t('probation.form.validation.email_required')).refine(
            (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            t('probation.form.validation.email_format'),
        ),
        birthday: optionalString().nullable(),
        gender: requiredString(t('probation.form.validation.gender_required')),
        identity: optionalString().nullable(),
        identityIssueDate: optionalString()
            .nullable()
            .refine((value) => {
                if (!value) return true;
                const inputDate = dayjs(value);
                const today = dayjs().endOf('day');
                return inputDate.isValid() && inputDate.isBefore(today);
            }, {
                message: t('candidate.validation.max_practice_issue_date'),
            }),
        identityIssuePlace: optionalString().nullable(),
        nationality: optionalString().nullable(),
        address: optionalString().nullable(),

        // Section 2: Thông tin lương và chế độ thử việc
        basicSalary: z.string().optional().nullable(),
        salaryType: z.enum(['NET', 'GROSS']).default('NET'),
        hasHealthInsurance: z.boolean().default(false),
        hasSocialInsurance: z.boolean().default(false),
        hasUnemploymentInsurance: z.boolean().default(false),

        // Section 3: Thông tin công việc
        managedDepartmentId: requiredString(t('probation.form.validation.department_required')),
        managedRoomId: optionalString().nullable(),
        workType: optionalString().nullable(),
        jobTitleId: requiredString(t('probation.form.validation.job_title_required')),
        position: requiredString(t('probation.form.validation.position_required')),
        contractType: requiredString(t('probation.form.validation.contract_type_required')),
        directManagerId: requiredString(t('probation.form.validation.direct_manager_required')),
        mentorId: requiredString(t('probation.form.validation.mentor_required')),

        // Section 4: Thời gian thử việc
        probationStartDate: requiredString(t('probation.form.validation.start_date_required')),
        probationMonths: z.number().min(1).default(2),
        probationEndDate: optionalString().nullable(),
        actualStartDate: optionalString().nullable(),
        probationReviewDate: requiredString(t('probation.form.validation.review_date_required')),

        // Section 5: Bằng cấp chuyên môn
        qualification: requiredString(t('probation.form.validation.qualification_required')),
        major: optionalString().nullable(),
        academicTitle: optionalString().nullable(),
        certificateNumber: optionalString().nullable(),
        certificateIssuePlace: optionalString().nullable(),
        certificateExpiryDate: optionalString().nullable(),

        // Section 6: Kế hoạch hội nhập
        onboardingDocumentsCompleted: z.boolean().default(false),
        onboardingDocumentsNote: optionalString().nullable(),
        onboardingContractSigned: z.boolean().default(false),
        onboardingContractNote: optionalString().nullable(),
        onboardingSystemAccountCreated: z.boolean().default(false),
        onboardingSystemAccountNote: optionalString().nullable(),
        onboardingStaffCardIssued: z.boolean().default(false),
        onboardingStaffCardNote: optionalString().nullable(),
        onboardingUniformIssued: z.boolean().default(false),
        onboardingUniformNote: optionalString().nullable(),
        onboardingOrientationCompleted: z.boolean().default(false),
        onboardingOrientationNote: optionalString().nullable(),
        probationWorkObjectives: optionalString().nullable(),

        // Section 7: Ghi chú
        note: optionalString().nullable(),
    });

export type ProbationCreateValues = z.infer<ReturnType<typeof probationCreateSchema>>;
