import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';

import { useAttendanceTable } from '../../hooks/use-timekeeping-management';
import { WorkSheetByShiftGrid } from './work-sheet-by-shift-grid';
import { WorkSheetByShiftList } from './work-sheet-by-shift-list';

export const WorkSheetByShift = () => {
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  const { data, isLoading } = useAttendanceTable({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    startDate,
    endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
  });

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
