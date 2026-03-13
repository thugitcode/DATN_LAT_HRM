import { queryOptions } from '@tanstack/react-query';
import { businessTripManagementService } from '@/services/other-requests-management/business-trip-management.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const businessTripManagementKeys = {
  all: ['business-trip-management'] as const,
  lists: () => [...businessTripManagementKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...businessTripManagementKeys.lists(), params] as const,
  details: () => [...businessTripManagementKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...businessTripManagementKeys.details(), id] as const,
} as const;

export const businessTripManagemenOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: businessTripManagementKeys.list(params),
      queryFn: () => businessTripManagementService.getAll(params),
    }),
} as const;
