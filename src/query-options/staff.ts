import { useQuery } from '@tanstack/react-query';
import { fetchStaff } from '@/services/staff';

import type { StaffParams } from '@/types/staff.type';

export const STAFF_QUERY_KEY = {
  list: (params?: StaffParams) => ['staff', 'list', params?.page, params?.limit],
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
