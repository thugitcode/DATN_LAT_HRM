import { queryOptions } from '@tanstack/react-query';

import type { ApiResponse } from '@/types';
import type { Identity } from '@/types/auth.type';
import { clinic40Api } from '@/lib/axios';

export const identityQueryOptions = () => {
  return queryOptions({
    queryKey: ['identity'],
    queryFn: async () => {
      const res = await clinic40Api.get<ApiResponse<Identity>>('/identity');

      return {
        identity: res.data.data,
      };
    },
  });
};
