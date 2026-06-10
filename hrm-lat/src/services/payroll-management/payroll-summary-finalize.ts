import type { ApiResponse } from '@/types';
import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type { SummaryFinalize } from '@/features/payroll-management/types/summary-finalize.type';
import type {
  ApprovePayload,
  Period,
  PeriodStatusResponsive,
} from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class PayrollSummaryFinalizeService extends BaseApiService<
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

  async getSumary(month: string): Promise<ApiResponse<SummaryFinalize>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/summary?month=${month}`);

      return res.data;
    });
  }

  async getSumaryLatest(): Promise<ApiResponse<SummaryFinalize>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/latest-summary`);

      return res.data;
    });
  }
}

export const payrollSummaryFinalizeService = new PayrollSummaryFinalizeService();
