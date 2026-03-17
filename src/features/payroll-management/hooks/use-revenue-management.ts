import { useQuery } from '@tanstack/react-query';

import { revenueOptions } from '@/services/query-options/revenue-management/revenue.query';
import type { RequestsParams } from '@/types/global.type';

export function useRevenueList(params?: RequestsParams) {
  return useQuery(revenueOptions.list(params));
}

export function useGetDetailRevenue(id: string) {
  return useQuery(revenueOptions.detail(id));
}
