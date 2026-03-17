import { queryOptions } from '@tanstack/react-query';
import { payrollFeedbackService } from '@/services/payroll-management/payroll-feedback.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const payrollFeedbackKeys = {
  all: ['payroll-feedback'] as const,
  lists: () => [...payrollFeedbackKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...payrollFeedbackKeys.lists(), params] as const,
  details: () => [...payrollFeedbackKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...payrollFeedbackKeys.details(), id] as const,
} as const;

export const payrollFeedbackOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: payrollFeedbackKeys.list(params),
      queryFn: () => payrollFeedbackService.getAll(params),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: payrollFeedbackKeys.detail(id),
      queryFn: () => payrollFeedbackService.getById(id),
    }),
} as const;
