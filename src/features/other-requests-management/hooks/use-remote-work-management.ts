import { useQuery } from '@tanstack/react-query';
import { remoteWorkManagementOptions } from '@/services/query-options/other-requests-management-options/remote-work-management.query';

import type { OtherRequestsManagementParams } from '../types/type';

export function useRemoteWorkManagement(params?: OtherRequestsManagementParams) {
  return useQuery(remoteWorkManagementOptions.list(params));
}
