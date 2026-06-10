import { hrmInstance } from '@/lib/axios';
import type { TrainingRegistrantion } from '@/features/other-requests-management/types/training-registrantion.type';
import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class TrainingRegistrationRanagementService extends BaseApiService<
  TrainingRegistrantion,
  unknown,
  unknown,
  OtherRequestsManagementParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.OTHER_REQUESTS_MANAGEMENT.TRAINING);
  }

  async getAll(params?: OtherRequestsManagementParams) {
    return super.getAll(params);
  }
}

export const trainingRegistrationRanagementService = new TrainingRegistrationRanagementService();
