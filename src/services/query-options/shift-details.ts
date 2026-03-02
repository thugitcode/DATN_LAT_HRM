import { queryOptions } from '@tanstack/react-query';
import { shiftDetailService } from '@/services/shift-details.service';

import type { StaffParams } from '@/types/staff.type';

export const shiftDetailsKeys = {
  all: ['shift-details'] as const,
  lists: () => [...shiftDetailsKeys.all, 'list'] as const,
  list: (params?: StaffParams) => [...shiftDetailsKeys.lists(), params] as const,
  details: () => [...shiftDetailsKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...shiftDetailsKeys.details(), id] as const,
} as const;

export const shiftDetailsQueryOptions = {
  list: (params?: StaffParams) =>
    queryOptions({
      queryKey: shiftDetailsKeys.list(params),
      queryFn: () => shiftDetailService.getAll(params),
    }),

  detail: (id: string | number) =>
    queryOptions({
      queryKey: shiftDetailsKeys.detail(id),
      queryFn: () => shiftDetailService.getById(id),
      enabled: !!id,
    }),
} as const;
