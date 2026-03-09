import { useMemo } from 'react';

import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { useCurrentLayout } from '@/features/timekeeping-shift-scheduling/hooks/use-current-layout';

import { useAttendanceByHours, useAttendanceTable } from '../hooks/use-timekeeping-management';
import { TAB_KEYS } from '../types/index.type';
import { useDetailsTimeSheetList } from './use-detailed-time-sheet';

export function useTimekeepingTabData(activeKey: TAB_KEYS) {
  const currentLayout = useCurrentLayout();
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  const commonParams = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    getAll: currentLayout === LayoutSwitcherEnum.GRID ? true : undefined,
  };

  const worksheetQuery = useAttendanceTable(
    activeKey === TAB_KEYS.WORKSHEET_BY_SHIFT ? commonParams : undefined,
  );

  const hourlyQuery = useAttendanceByHours(
    activeKey === TAB_KEYS.HOURLY_PAYROLL ? commonParams : undefined,
  );

    const detailedQuery = useDetailsTimeSheetList(
      activeKey === TAB_KEYS.DETAILED_TIME_SHEET ? commonParams : undefined,
    );

  return useMemo(() => {
    switch (activeKey) {
      case TAB_KEYS.WORKSHEET_BY_SHIFT:
        return worksheetQuery.data?.data ?? [];
      case TAB_KEYS.HOURLY_PAYROLL:
        return hourlyQuery.data?.data ?? [];
      case TAB_KEYS.DETAILED_TIME_SHEET:
        return detailedQuery?.data?.data;
      default:
        return [];
    }
  }, [activeKey, worksheetQuery.data, hourlyQuery.data]);
}
