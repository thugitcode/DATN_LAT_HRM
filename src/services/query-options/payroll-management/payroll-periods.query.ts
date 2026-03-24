import { queryOptions } from '@tanstack/react-query';
import { payrollPerriodsService } from '@/services/payroll-management/payroll-periods.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const payrollPeriodsKeys = {
  all: ['payroll-periods'] as const,
  lists: () => [...payrollPeriodsKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...payrollPeriodsKeys.lists(), params] as const,
  details: () => [...payrollPeriodsKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...payrollPeriodsKeys.details(), id] as const,
  status: (month: string | number) => [...payrollPeriodsKeys.all, 'status', month] as const,
} as const;

export const payrollPeriodsOptions = {
  status: (month: string) =>
    queryOptions({
      queryKey: payrollPeriodsKeys.status(month),
      enabled: !!month,
      queryFn: () => payrollPerriodsService.getStatus(month),
      meta: { silentError: true },
      retry: false,
    }),
} as const;
