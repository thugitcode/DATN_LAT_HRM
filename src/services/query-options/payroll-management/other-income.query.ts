import { queryOptions } from '@tanstack/react-query';
import { otherIncomeService } from '@/services/payroll-management/other-income.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const otherIncomeKeys = {
  all: ['other-income'] as const,
  lists: () => [...otherIncomeKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) => [...otherIncomeKeys.lists(), params] as const,
  details: () => [...otherIncomeKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...otherIncomeKeys.details(), id] as const,
} as const;

export const otherIncomeOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: otherIncomeKeys.list(params),
      queryFn: () => otherIncomeService.getAll(params),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: otherIncomeKeys.detail(id),
      enabled: !!id,
      queryFn: () => otherIncomeService.getDetail(id),
    }),
} as const;
