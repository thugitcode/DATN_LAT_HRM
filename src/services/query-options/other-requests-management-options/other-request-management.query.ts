import { queryOptions } from '@tanstack/react-query';
import { otherRequestManagementService } from '@/services/other-requests-management/other-requests-management.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const otherRequestManagementKeys = {
  all: ['business-trip-management'] as const,
  lists: () => [...otherRequestManagementKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...otherRequestManagementKeys.lists(), params] as const,
  details: () => [...otherRequestManagementKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...otherRequestManagementKeys.details(), id] as const,
} as const;

export const otherRequestManagemenOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: otherRequestManagementKeys.list(params),
      queryFn: () => otherRequestManagementService.getAll(params),
    }),
} as const;
