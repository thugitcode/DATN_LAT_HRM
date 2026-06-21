import { z } from 'zod';
import type { TFunction } from 'i18next';
import { salaryInnerSchema } from '../salary-and-benefits/schemas';

export const staffContractSchema = (t: TFunction<'staff-management'>) => z.object({
    contractType: z.string().min(1, t('contract_info.validation.contract_type_required')),
    workType: z.string().min(1, t('contract_info.validation.work_type_required')).nullable(),
    jobTitleId: z.string().min(1, t('contract_info.validation.job_title_required')),
    position: z.string().min(1, t('contract_info.validation.position_required')),
    workingTime: z.string().optional().default(''),
    workingTimeUnit: z.enum(['DAY', 'WEEK', 'MONTH']),
    managedRoomId: z.string().optional().default(''),
    managedDepartmentId: z.string().optional().default(''),
    duration: z.string().optional().default(''),
    durationUnit: z.enum(['YEAR', 'MONTH']),
    contractNumber: z.string().optional().default(''),
    startDate: z.string().optional().default(''),
    endDate: z.string().optional().default(''),
    roomId: z.string().optional(),
    directManagerIds: z.array(z.string()).optional().default([]),
    shiftType: z.string().optional().default(''),
    fixedShiftId: z.string().optional(),
    workingDays: z.array(z.number()).optional().default([]),
    workingAreas: z
        .array(
            z.object({
                departmentId: z.string().min(1, t('contract_info.validation.working_area_department_required')),
                roomId: z.array(z.string()).optional(),
            })
        )
        .min(1, t('contract_info.validation.working_area_required'))
        .refine(
            (areas) => areas.every((area) => area.departmentId),
            { message: t('contract_info.validation.working_area_department_required') }
        ),
    salary: salaryInnerSchema,
});

export type StaffContractFormValues = z.infer<ReturnType<typeof staffContractSchema>>;