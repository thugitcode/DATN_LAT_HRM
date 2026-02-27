import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { Staff } from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class StaffService extends BaseApiService<Staff, StaffParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.STAFF);
  }

  async getAll(params?: StaffParams) {
    return super.getAll({
      ...DEFAULT_PAGINATION,
      ...params,
    });
  }
}

export const staffService = new StaffService();
