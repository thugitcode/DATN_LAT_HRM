import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { DetailsTimeSheetRecord } from '@/types/shift-details.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class ShiftDetailService extends BaseApiService<DetailsTimeSheetRecord, StaffParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.SHIFT_DETAILS);
  }

  async getAll(params?: StaffParams) {
    return super.getAll({ ...DEFAULT_PAGINATION, ...params });
  }
}

export const shiftDetailService = new ShiftDetailService();
