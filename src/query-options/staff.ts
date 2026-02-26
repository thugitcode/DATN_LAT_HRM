import { useQuery } from '@tanstack/react-query';
import { fetchStaff, fetchStaffDetail } from '@/services/staff';

import type { StaffParams } from '@/types/staff.type';

export const STAFF_QUERY_KEY = {
  list: (params?: StaffParams) => ['staff', 'list', params],
  detail: (id: string) => ['staff', 'detail', id],
};

export const useStaffList = (
  params?: StaffParams,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery({
    queryKey: STAFF_QUERY_KEY.list(params),
    queryFn: () => fetchStaff(params),
    enabled: options?.enabled ?? true,
  });
};

export const useStaffDetail = (id: string) => {
  return useQuery({
    queryKey: STAFF_QUERY_KEY.detail(id),
    queryFn: () => fetchStaffDetail(id),
    enabled: !!id,
  });
};
