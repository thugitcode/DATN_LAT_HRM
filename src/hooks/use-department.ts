import { useQuery } from '@tanstack/react-query';
import { departmentQueryOptions } from '@/services/query-options/department.query';

import type { PaginationParams } from '@/types';

export function useDepartment(params?: PaginationParams) {
  return useQuery(departmentQueryOptions.list(params));
}
