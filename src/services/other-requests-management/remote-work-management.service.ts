import { hrmInstance } from '@/lib/axios';
import type { RemoteWork } from '@/features/other-requests-management/types/remote-work.type';
import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class RemoteworkManagementService extends BaseApiService<
  RemoteWork,
  unknown,
  unknown,
  OtherRequestsManagementParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.OTHER_REQUESTS_MANAGEMENT.REMOTE_WORK);
  }

  async getAll(params?: OtherRequestsManagementParams) {
    return super.getAll(params);
  }
}

export const remoteworkManagementService = new RemoteworkManagementService();
