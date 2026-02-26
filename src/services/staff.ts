import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { ApiResponse } from '@/types';
import type { Staff } from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance, normalizeAxiosError } from '@/lib/axios';

export const fetchStaff = async (params?: StaffParams): Promise<ApiResponse<Staff[]>> => {
  try {
    const response = await hrmInstance.get('/staff', {
      params: {
        ...DEFAULT_PAGINATION,
        ...params,
      },
    });

    return response.data;
  } catch (err: unknown) {
    throw normalizeAxiosError(err);
  }
};

export const fetchStaffDetail = async (id: string): Promise<ApiResponse<Staff>> => {
  try {
    const response = await hrmInstance.get(`/staff/${id}`);
    return response.data;
  } catch (err: unknown) {
    throw normalizeAxiosError(err);
  }
};
