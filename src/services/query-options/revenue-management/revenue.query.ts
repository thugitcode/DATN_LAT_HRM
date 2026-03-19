import { queryOptions, useMutation } from '@tanstack/react-query';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';
import { revenueService } from '@/services/revenue-management/revenue.service';
import type { RevenueDataListType } from '@/features/payroll-management/types/revenue.type';

export const revenueKeys = {
  all: ['revenue'] as const,
  lists: () => [...revenueKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...revenueKeys.lists(), params] as const,
  details: () => [...revenueKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...revenueKeys.details(), id] as const,
} as const;

export const revenueOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: revenueKeys.list(params),
      queryFn: () => revenueService.getAll(params),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: revenueKeys.detail(id),
      queryFn: () => revenueService.getById(id),
    }),
  patch: (id: string, data: RevenueDataListType) =>
    useMutation({
      mutationFn: () => revenueService.patch(id, data),
    }),
} as const;
