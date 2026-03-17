import { queryOptions } from '@tanstack/react-query';
import { kpiService } from '@/services/payroll-management/kpi.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const kpiKeys = {
  all: ['kpi'] as const,
  lists: () => [...kpiKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) => [...kpiKeys.lists(), params] as const,
  details: () => [...kpiKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...kpiKeys.details(), id] as const,
} as const;

export const kpiOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: kpiKeys.list(params),
      queryFn: () => kpiService.getAll(params),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: kpiKeys.detail(id),
      enabled: !!id,
      queryFn: () => kpiService.getDetail(id),
    }),
} as const;
