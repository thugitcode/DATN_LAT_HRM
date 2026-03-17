import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type { Kpi, KpiMutatePayload } from '@/features/payroll-management/types/kpi.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class KpiService extends BaseApiService<Kpi, unknown, unknown, RequestsParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.PAYROLL_MANAGEMENT.KPI);
  }

  async getAll(params?: RequestsParams) {
    return super.getAll(params);
  }

  async getDetail(id: string) {
    return super.getById(id);
  }

  async create(data: KpiMutatePayload) {
    return super.create(data);
  }

  async delete(id: string) {
    return super.delete(id);
  }
}

export const kpiService = new KpiService();
