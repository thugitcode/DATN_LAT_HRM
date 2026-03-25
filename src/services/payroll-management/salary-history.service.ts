import type { ApiResponse } from '@/types';
import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type { SalaryHistory } from '@/features/payroll-management/types/salary-history.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class SalaryHistoryService extends BaseApiService<SalaryHistory, unknown, unknown, RequestsParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.PAYROLL_MANAGEMENT.SALARY_STAFF_HISTORY);
  }

  async getStaffSalary(id: string): Promise<ApiResponse<SalaryHistory>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url(id)}/history`);

      return res.data;
    });
  }
}

export const salaryHistoryService = new SalaryHistoryService();
