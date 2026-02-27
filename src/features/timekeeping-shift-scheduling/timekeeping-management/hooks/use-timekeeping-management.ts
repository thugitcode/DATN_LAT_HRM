import { useQuery } from '@tanstack/react-query';
import { timekeepingManagementQueryOptions } from '@/services/query-options/timekeeping-management.query';

import type { ShiftManagementParams } from '@/types/shift-management.type';

export function useAttendanceTable(params?: ShiftManagementParams) {
  return useQuery(timekeepingManagementQueryOptions.attendanceTable(params));
}

// export function useAttendanceByHours(params?: ShiftManagementParams) {
//   return useQuery(timekeepingManagementQueryOptions.attendanceByHours(params));
// }
