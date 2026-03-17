import { hrmInstance } from '@/lib/axios';
import type { GeneralRequest } from '@/features/other-requests-management/types/generate-request.type';
import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class OtherRequestManagementService extends BaseApiService<
  GeneralRequest,
  unknown,
  unknown,
  OtherRequestsManagementParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.OTHER_REQUESTS_MANAGEMENT.GENERAL_REQUEST);
  }

  async getAll(params?: OtherRequestsManagementParams) {
    return super.getAll(params);
  }
}

export const otherRequestManagementService = new OtherRequestManagementService();
