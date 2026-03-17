import { useQuery } from '@tanstack/react-query';
import { otherRequestManagemenOptions } from '@/services/query-options/other-requests-management-options/other-request-management.query';

import type { OtherRequestsManagementParams } from '../types/type';

export function useOtherRequestpManagement(params?: OtherRequestsManagementParams) {
  return useQuery(otherRequestManagemenOptions.list(params));
}
