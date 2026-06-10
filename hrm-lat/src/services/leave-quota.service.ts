import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { LeaveQuota } from '@/types/leave-quota.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class LeaveQuotaService extends BaseApiService<LeaveQuota, StaffParams> {
  constructor() {
    super(hrmInstance, '/leave-quota');
  }

  async getAll(params?: StaffParams) {
    return super.getAll({
      ...DEFAULT_PAGINATION,
      ...params,
    });
  }
}

export const leaveQuotaService = new LeaveQuotaService();
