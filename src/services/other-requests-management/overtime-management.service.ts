import { hrmInstance } from '@/lib/axios';
import type { OverTime } from '@/features/other-requests-management/types/overtime.type';
import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class OvertimeManagementService extends BaseApiService<
  OverTime,
  unknown,
  unknown,
  OtherRequestsManagementParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.OTHER_REQUESTS_MANAGEMENT.OVERTIME);
  }

  async getAll(params?: OtherRequestsManagementParams) {
    return super.getAll(params);
  }
}

export const overtimeManagementService = new OvertimeManagementService();
