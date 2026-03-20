import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { shiftDetailService } from '@/services/shift-details.service';

import type { StaffParams } from '@/types/staff.type';

export const shiftDetailsKeys = {
  all: ['shift-details'] as const,
  lists: () => [...shiftDetailsKeys.all, 'list'] as const,
  list: (params?: StaffParams) => [...shiftDetailsKeys.lists(), params] as const,
  infiniteLists: () => [...shiftDetailsKeys.all, 'infinite-list'] as const,
  infiniteList: (params?: StaffParams) => [...shiftDetailsKeys.infiniteLists(), params] as const,
  details: () => [...shiftDetailsKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...shiftDetailsKeys.details(), id] as const,
} as const;

export const shiftDetailsQueryOptions = {
  list: (params?: StaffParams) =>
    queryOptions({
      queryKey: shiftDetailsKeys.list(params),
      queryFn: () => shiftDetailService.getAll(params),
    }),

  infiniteList: (params?: StaffParams) =>
    infiniteQueryOptions({
      queryKey: shiftDetailsKeys.infiniteList(params),
      queryFn: ({ pageParam = 1 }) => shiftDetailService.getAll({ ...params, page: pageParam as number }),
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination?.hasNextPage) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    }),

  detail: (id: string | number) =>
    queryOptions({
      queryKey: shiftDetailsKeys.detail(id),
      queryFn: () => shiftDetailService.getById(id),
      enabled: !!id,
    }),
} as const;
