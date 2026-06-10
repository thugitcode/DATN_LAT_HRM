import { z } from 'zod';
import type { TFunction } from 'i18next';
import { salaryInnerSchema } from '../salary-and-benefits/schemas';
import { requiredString } from '../staff-list-management/schemas/staff.schema';

export const staffContractSchema = (t: TFunction<'staff-management'>) => z.object({
    contractType: z.string().min(1, t('contract_info.validation.contract_type_required')),
    workType: z.string().min(1, t('contract_info.validation.work_type_required')).nullable(),
    jobTitleId: z.string().min(1, t('contract_info.validation.job_title_required')),
    position: z.string().min(1, t('contract_info.validation.position_required')),
    workingTime: z.string().min(1, t('contract_info.validation.working_time_required')).refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        t('contract_info.validation.working_time_positive')
    ),
    workingTimeUnit: z.enum(['DAY', 'WEEK', 'MONTH']),
    managedRoomId: requiredString(t('contract_info.validation.managed_room_required')),
    managedDepartmentId: requiredString(t('contract_info.validation.managed_department_required')),
    duration: z.string().min(1, t('contract_info.validation.duration_required')).refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        t('contract_info.validation.duration_positive')
    ),
    durationUnit: z.enum(['YEAR', 'MONTH']),
    contractNumber: z.string().min(1, t('contract_info.validation.contract_number_required')),
    startDate: z.string().min(1, t('contract_info.validation.start_date_required')),
    endDate: z.string().min(1, t('contract_info.validation.end_date_required')),
    roomId: z.string().optional(),
    directManagerIds: z.array(z.string()).min(1, t('contract_info.validation.direct_manager_required')),
    shiftType: z.string().min(1, t('contract_info.validation.shift_type_required')),
    fixedShiftId: z.string().optional(),
    workingDays: z.array(z.number()).min(1, t('contract_info.validation.working_days_required')),
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
}).refine(
    (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start < end;
    },
    {
        message: t('contract_info.validation.end_date_after_start'),
        path: ['endDate'],
    }
);

export type StaffContractFormValues = z.infer<ReturnType<typeof staffContractSchema>>;
