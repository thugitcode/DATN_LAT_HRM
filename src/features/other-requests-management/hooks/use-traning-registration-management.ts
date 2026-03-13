import { useQuery } from '@tanstack/react-query';
import { trainingRegistrationManagementOptions } from '@/services/query-options/other-requests-management-options/training-registration-management.query';

import type { OtherRequestsManagementParams } from '../types/type';

export function useTrainingRegistrationManagement(params?: OtherRequestsManagementParams) {
  return useQuery(trainingRegistrationManagementOptions.list(params));
}
