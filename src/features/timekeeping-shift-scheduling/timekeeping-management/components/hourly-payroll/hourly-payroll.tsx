import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';

import { useAttendanceTable } from '../../hooks/use-timekeeping-management';
import { HourlyPayrollGrid } from './hourly-payroll-grid';
import { HourlyPayrollList } from './hourly-payroll-list';

export const HourlyPayroll = () => {
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  // const { data, isLoading } = useAttendanceTable({
  //   page: filters.page ?? 1,
  //   limit: filters.limit ?? 10,
  //   startDate,
  //   endDate,
  //   search: filters.search,
  //   departmentId: filters.departmentId,
  //   roomId: filters.roomId,
  // });

  // console.log('useAttendanceTable_____________data', data);

  return (
    <LayoutRenderer
      layouts={{
        [LayoutSwitcherEnum.LIST]: {
          component: HourlyPayrollList,
          props: {},
        },
        [LayoutSwitcherEnum.GRID]: {
          component: HourlyPayrollGrid,
          props: {},
        },
      }}
    />
  );
};
