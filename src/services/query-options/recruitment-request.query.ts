import { queryOptions } from '@tanstack/react-query';

import type { RecruitmentRequestFilters } from '@/features/recruitment-management/recruitment-request-list/types/type';

import { recruitmentRequestService } from '../recruitment-request.service';

export const recruitmentRequestKeys = {
  all: ['recruitment-request'] as const,
  lists: () => [...recruitmentRequestKeys.all, 'list'] as const,
  list: (params?: RecruitmentRequestFilters) =>
    [...recruitmentRequestKeys.lists(), params] as const,
  details: () => [...recruitmentRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...recruitmentRequestKeys.details(), id] as const,
} as const;

export const recruitmentRequestQueryOptions = {
  list: (params?: RecruitmentRequestFilters) =>
    queryOptions({
      queryKey: recruitmentRequestKeys.list(params),
      queryFn: () => recruitmentRequestService.getAll(params),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: recruitmentRequestKeys.detail(id),
      queryFn: () => recruitmentRequestService.getById(id),
      enabled: !!id,
    }),
} as const;
