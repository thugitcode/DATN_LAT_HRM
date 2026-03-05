import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';
import { useCurrentLayout } from '@/features/timekeeping-shift-scheduling/hooks/use-current-layout';

import { useAttendanceByHours } from '../../hooks/use-timekeeping-management';
import { HourlyPayrollGrid } from './hourly-payroll-grid';
import { HourlyPayrollList } from './hourly-payroll-list';

export const HourlyPayroll = () => {
  const currentLayout = useCurrentLayout();
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  const { data, isLoading } = useAttendanceByHours({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    getAll: currentLayout === LayoutSwitcherEnum.GRID,
  });

  return (
    <LayoutRenderer
      layouts={{
        [LayoutSwitcherEnum.LIST]: {
          component: HourlyPayrollList,
          props: {
            data: data?.data,
            isLoading,
            total: data?.pagination?.total,
            page: filters.page,
            pageSize: filters.limit,
            totalPage: data?.pagination?.totalPage,
          },
        },
        [LayoutSwitcherEnum.GRID]: {
          component: HourlyPayrollGrid,
          props: { data: data?.data, isLoading },
        },
      }}
    />
  );
};
