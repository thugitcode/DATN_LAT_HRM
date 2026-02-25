import { useQuery } from '@tanstack/react-query';
import { roomQueryOptions } from '@/services/query-options/room.query';

import type { PaginationParams } from '@/types';

export function useRoom(params?: PaginationParams) {
  return useQuery(roomQueryOptions.list(params));
}
