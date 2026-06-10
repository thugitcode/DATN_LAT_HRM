import { queryOptions } from '@tanstack/react-query';

import type { ProbationFilters } from '@/features/recruitment-management/probation-management/types/probation.type';
import { probationService } from '@/services/recruitment-management/probation.service';

export const probationKeys = {
  all: ['probation'] as const,
  lists: () => [...probationKeys.all, 'list'] as const,
  list: (params?: ProbationFilters) => [...probationKeys.lists(), params] as const,
  details: () => [...probationKeys.all, 'detail'] as const,
  detail: (id: string) => [...probationKeys.details(), id] as const,
  evaluations: (id: string) => [...probationKeys.all, 'evaluations', id] as const,
} as const;

export const probationQueryOptions = {
  list: (params?: ProbationFilters) =>
    queryOptions({
      queryKey: probationKeys.list(params),
      queryFn: () => probationService.getAll(params),
    }),
  evaluations: (id: string) =>
    queryOptions({
      queryKey: probationKeys.evaluations(id),
      queryFn: () => probationService.getEvaluations(id),
      enabled: !!id,
    }),
} as const;
