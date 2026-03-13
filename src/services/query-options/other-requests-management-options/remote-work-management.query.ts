import { queryOptions } from '@tanstack/react-query';
import { remoteworkManagementService } from '@/services/other-requests-management/remote-work-management.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const remoteWorkManagementKeys = {
  all: ['remote-work-management'] as const,
  lists: () => [...remoteWorkManagementKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...remoteWorkManagementKeys.lists(), params] as const,
  details: () => [...remoteWorkManagementKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...remoteWorkManagementKeys.details(), id] as const,
} as const;

export const remoteWorkManagementOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: remoteWorkManagementKeys.list(params),
      queryFn: () => remoteworkManagementService.getAll(params),
    }),
} as const;
