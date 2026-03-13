import { queryOptions } from '@tanstack/react-query';
import { overtimeManagementService } from '@/services/other-requests-management/overtime-management.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const overtimeManagementKeys = {
  all: ['overtime-management'] as const,
  lists: () => [...overtimeManagementKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...overtimeManagementKeys.lists(), params] as const,
  details: () => [...overtimeManagementKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...overtimeManagementKeys.details(), id] as const,
} as const;

export const overtimeManagementOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: overtimeManagementKeys.list(params),
      queryFn: () => overtimeManagementService.getAll(params),
    }),
} as const;
