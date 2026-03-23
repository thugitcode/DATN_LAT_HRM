import { queryOptions } from '@tanstack/react-query';

import type { ShiftTemplateParams } from '@/types/shift-template.type';

import { configurationService } from '../configuration.service';

export const configurationKeys = {
  all: ['configuration'] as const,
  lists: () => [...configurationKeys.all, 'list'] as const,
  list: (params?: ShiftTemplateParams) => [...configurationKeys.lists(), params] as const,
  details: () => [...configurationKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...configurationKeys.details(), id] as const,
} as const;

export const configurationQueryOptions = {
  list: (params?: ShiftTemplateParams) =>
    queryOptions({
      queryKey: configurationKeys.list(params),
      queryFn: () => configurationService.getList(params),
    }),
} as const;
