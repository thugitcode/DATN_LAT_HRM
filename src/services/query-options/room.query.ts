import { queryOptions } from '@tanstack/react-query';

import type { PaginationParams } from '@/types';

import { roomService } from '../room.service';

export const roomKeys = {
  all: ['room'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...roomKeys.lists(), params] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...roomKeys.details(), id] as const,
} as const;

export const roomQueryOptions = {
  list: (params?: PaginationParams) =>
    queryOptions({
      queryKey: roomKeys.list(params),
      queryFn: () => roomService.getAll(params),
    }),

  detail: (id: string | number) =>
    queryOptions({
      queryKey: roomKeys.detail(id),
      queryFn: () => roomService.getById(id),
      enabled: !!id,
    }),
} as const;
