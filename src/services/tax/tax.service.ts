import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type { PayrollApiResponse } from '@/features/payroll-management/types/payroll-caculation.type';
import type { ApprovePayload } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class TaxService extends BaseApiService<
  PayrollApiResponse,
  ApprovePayload,
  PayrollApiResponse,
  RequestsParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.TAX);
  }
  async getTaxRate() {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/rate`);
      return res.data;
    });
  }
  async getTaxBracket() {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/bracket`);
      return res.data;
    });
  }
}

export const taxService = new TaxService();
