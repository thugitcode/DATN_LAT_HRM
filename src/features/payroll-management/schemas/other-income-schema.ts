/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from '@/i18n';
import { z } from 'zod';

import { Status } from '@/types/global.type';

import { KpiSourceEnum } from '../types/kpi.type';

const t = (key: string, options?: object) => {
  const result = (i18n.t as any)(key, { ns: 'payroll-management', ...options });
  return result as string;
};

export const createOtherIncomeMutateSchema = () =>
  z.object({
    staffCode: z.string().min(1, t('otherIncome.validation.staff_code_required')),
    name: z.string().min(1, t('otherIncome.validation.name_required')),
    departmentId: z.string().min(1, t('otherIncome.validation.department_required')),
    roomId: z.string().min(1, t('otherIncome.validation.room_required')),
    staffId: z.string().min(1, t('otherIncome.validation.staff_id_required')),

    type: z.string().min(1, t('otherIncome.validation.type_required')),
    allowanceId: z.string().min(1, t('otherIncome.validation.allowance_id_required')),
    amount: z
      .string()
      .min(1, t('otherIncome.validation.amount_required'))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t('otherIncome.validation.amount_invalid'),
      }),
    date: z.string().min(1, t('otherIncome.validation.date_required')),
    description: z.string().optional(),
    entryPersonId: z.string().min(1, t('otherIncome.validation.entry_person_required')),

    month: z.string().optional(),
    source: z.nativeEnum(KpiSourceEnum).default(KpiSourceEnum.WEB),
    status: z.nativeEnum(Status).default(Status.PENDING),
    attachments: z.array(z.any()).optional(),
  });

export type OtherIncomeMutateFormValues = z.infer<ReturnType<typeof createOtherIncomeMutateSchema>>;
