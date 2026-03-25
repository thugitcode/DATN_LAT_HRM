import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type { PayrollApiResponse } from '@/features/payroll-management/types/payroll-caculation.type';
import type { ApprovePayload } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class PayrollByMonthService extends BaseApiService<
  PayrollApiResponse,
  ApprovePayload,
  PayrollApiResponse,
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
  // /payroll/results/:id/detailed
  async getResultDetails(id: string) {
    return this.request(async () => {
      const res = await this.instance.get(`payroll/results/${id}/detailed`);
      return res.data;
    });
  }
}

export const payrollByMonthService = new PayrollByMonthService();
