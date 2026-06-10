import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type {
  OtherIncome,
  OtherIncomePayload,
} from '@/features/payroll-management/types/other-income.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class OtherIncomeService extends BaseApiService<OtherIncome, unknown, unknown, RequestsParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.PAYROLL_MANAGEMENT.OTHER_INCOME);
  }

  async getAll(params?: RequestsParams) {
    return super.getAll(params);
  }

  async getDetail(id: string) {
    return super.getById(id);
  }

  async create(data: OtherIncomePayload) {
    return super.create(data);
  }

  async update(id: string | number, payload: OtherIncomePayload) {
    return super.update(id, payload);
  }

  async delete(id: string) {
    return super.delete(id);
  }
}

export const otherIncomeService = new OtherIncomeService();
