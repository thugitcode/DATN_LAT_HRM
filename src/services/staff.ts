import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { ApiResponse } from '@/types';
import type { Staff, StaffParams } from '@/types/staff.type';
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

export const updateStaff = async (id: string, data: Partial<Staff>): Promise<ApiResponse<boolean>> => {
  try {
    const response = await hrmInstance.patch(`/staff/${id}`, data);
    return response.data;
  } catch (err: unknown) {
    throw normalizeAxiosError(err);
  }
};

export const importStaff = async (data: { rows: any[] }): Promise<ApiResponse<boolean>> => {
  try {
    const response = await hrmInstance.post('/staff/import', data);
    return response.data;
  } catch (err: unknown) {
    throw normalizeAxiosError(err);
  }
};

export const createStaff = async (data: Partial<Staff>): Promise<ApiResponse<Staff>> => {
  try {
    const response = await hrmInstance.post('/staff', data);
    return response.data;
  } catch (err: unknown) {
    throw normalizeAxiosError(err);
  }
};
