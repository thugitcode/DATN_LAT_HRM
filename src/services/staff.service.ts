import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { ApiResponse } from '@/types';
import type { Staff } from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';
import type { SalaryFormValues } from '@/features/staff-management/salary-and-benefits/schemas';
import type { SalaryAndBenefits } from '@/features/staff-management/types/salary-and-benefits';

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

  async getDetailsStaffSalary(id: string): Promise<ApiResponse<SalaryAndBenefits>> {
    return this.request(async () => {
      const res = await this.instance.get(`/staff-salary/staff/${id}`);
      return res.data;
    });
  }

  async patchDetailsStaffSalary(id: string, payload: SalaryFormValues): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`/staff-salary/staff/${id}`, payload.salary);
      return res.data;
    });
  }
}

export const staffService = new StaffService();
