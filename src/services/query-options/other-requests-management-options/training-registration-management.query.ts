import { queryOptions } from '@tanstack/react-query';
import { trainingRegistrationRanagementService } from '@/services/other-requests-management/training-registration-management.service';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

export const trainingRegistrationManagementKeys = {
  all: ['remote-work-management'] as const,
  lists: () => [...trainingRegistrationManagementKeys.all, 'list'] as const,
  list: (params?: OtherRequestsManagementParams) =>
    [...trainingRegistrationManagementKeys.lists(), params] as const,
  details: () => [...trainingRegistrationManagementKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...trainingRegistrationManagementKeys.details(), id] as const,
} as const;

export const trainingRegistrationManagementOptions = {
  list: (params?: OtherRequestsManagementParams) =>
    queryOptions({
      queryKey: trainingRegistrationManagementKeys.list(params),
      queryFn: () => trainingRegistrationRanagementService.getAll(params),
    }),
} as const;
