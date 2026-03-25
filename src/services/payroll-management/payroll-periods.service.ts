import type { ApiResponse } from '@/types';
import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type {
  ApprovePayload,
  Period,
  PeriodStatusResponsive,
} from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class PayrollPerriodsService extends BaseApiService<
  unknown,
  ApprovePayload,
  unknown,
  RequestsParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.PAYROLL_MANAGEMENT.PAYROLL_BY_MONTH);
  }

  async getAll(params?: RequestsParams) {
    return super.getAll(params);
  }

  async create(data: ApprovePayload) {
    return super.create(data);
  }

  async getStatus(month: string): Promise<ApiResponse<PeriodStatusResponsive>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/status?month=${month}`);

      return res.data;
    });
  }
}

export const payrollPerriodsService = new PayrollPerriodsService();
