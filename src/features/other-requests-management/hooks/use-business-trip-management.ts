import { useQuery } from '@tanstack/react-query';
import { businessTripManagemenOptions } from '@/services/query-options/other-requests-management-options/business-trip-management.query';

import type { OtherRequestsManagementParams } from '../types/type';

export function useBusinessTripManagement(params?: OtherRequestsManagementParams) {
  return useQuery(businessTripManagemenOptions.list(params));
}
