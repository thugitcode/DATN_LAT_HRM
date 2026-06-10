import { hrmInstance } from '@/lib/axios';
import type { BusinessTrip } from '@/features/other-requests-management/types/business-trip.type';
import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class BusinessTripManagementService extends BaseApiService<
  BusinessTrip,
  unknown,
  unknown,
  OtherRequestsManagementParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.OTHER_REQUESTS_MANAGEMENT.BUSINESS_TRIP);
  }

  async getAll(params?: OtherRequestsManagementParams) {
    return super.getAll(params);
  }
}

export const businessTripManagementService = new BusinessTripManagementService();
