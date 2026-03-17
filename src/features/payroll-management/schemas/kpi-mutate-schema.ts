/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from '@/i18n';
import { z } from 'zod';

import { Status } from '@/types/global.type';

import { KpiRatingEnum, KpiSourceEnum } from '../types/kpi.type';

const t = (key: string, options?: object) => {
  const result = (i18n.t as any)(key, { ns: 'payroll-management', ...options });
  return result as string;
};

export const createKpiMutateSchema = () =>
  z.object({
    staffCode: z.string().min(1, t('kpi.validation.staff_id_required')),
    name: z.string().min(1, t('kpi.validation.name_required')),
    departmentId: z.string().min(1, t('kpi.validation.department_required')),
    roomId: z.string().min(1, t('kpi.validation.room_required')),

    staffId: z.string().min(1, t('kpi.validation.staff_id_required')),

    month: z.string().optional(),

    kpiScore: z.string().min(1, t('kpi.validation.kpi_score_required')),

    rating: z.string().min(1, t('kpi.validation.rating_required')).optional(),

    evaluatorId: z.string().min(1, t('kpi.validation.evaluator_required')),

    source: z.nativeEnum(KpiSourceEnum).default(KpiSourceEnum.WEB),

    status: z.nativeEnum(Status).default(Status.PENDING),

    note: z.string().optional(),
  });

export type KpiMutateFormValues = z.infer<ReturnType<typeof createKpiMutateSchema>>;
