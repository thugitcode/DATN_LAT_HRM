import { useMemo } from 'react';

import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';
import { useCurrentLayout } from '@/features/timekeeping-shift-scheduling/hooks/use-current-layout';

import { useAttendanceTable } from '../../hooks/use-timekeeping-management';
import { WorkSheetByShiftGrid } from './work-sheet-by-shift-grid';
import { WorkSheetByShiftList } from './work-sheet-by-shift-list';

export const WorkSheetByShift = () => {
  const currentLayout = useCurrentLayout();

  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  const queryParams = useMemo(
    () => ({
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      fromDate: startDate,
      toDate: endDate,
      search: filters.search,
      departmentId: filters.departmentId,
      roomId: filters.roomId,
    }),
    [
      filters.page,
      filters.limit,
      filters.search,
      filters.departmentId,
      filters.roomId,
      startDate,
      endDate,
    ],
  );

  const { data, isLoading } = useAttendanceTable(queryParams);

  return (
    <LayoutRenderer
      layouts={{
        [LayoutSwitcherEnum.LIST]: {
          component: WorkSheetByShiftList,
          props: {
            data: data?.data,
            total: data?.pagination?.total,
            page: filters.page,
            isLoading,
            pageSize: filters.limit,
            totalPage: data?.pagination?.totalPage,
          },
        },
        [LayoutSwitcherEnum.GRID]: {
          component: WorkSheetByShiftGrid,
          props: { data: data?.data, isLoading },
        },
      }}
    />
  );
};
