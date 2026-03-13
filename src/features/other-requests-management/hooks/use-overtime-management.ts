import { useQuery } from '@tanstack/react-query';
import { overtimeManagementOptions } from '@/services/query-options/other-requests-management-options/overtime-management.query';

import type { OtherRequestsManagementParams } from '../types/type';

export function useOvertimeManagement(params?: OtherRequestsManagementParams) {
  return useQuery(overtimeManagementOptions.list(params));
}
