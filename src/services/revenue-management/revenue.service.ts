import { hrmInstance } from '@/lib/axios';
import type { RequestsParams } from '@/types/global.type';

import type { RevenueDataListType } from '@/features/payroll-management/types/revenue.type';
import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class RevenueService extends BaseApiService<
  RevenueDataListType,
  unknown,
  unknown,
  RequestsParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.STAFF_REVENUE);
  }

  async getAll(params?: RequestsParams) {
    return super.getAll(params);
  }

  async getDetail(id: string) {
    return super.getById(id);
  }
}

export const revenueService = new RevenueService();
