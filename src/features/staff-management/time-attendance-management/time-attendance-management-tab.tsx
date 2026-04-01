import { useParams } from '@tanstack/react-router';

import type { ShiftManagementParams } from '@/types';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { useStaffDailyAttendance } from '@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management';

import AttendanceSummary from './components/attendance-summary';
import { Header } from './components/header';
import { ShiftEntry } from './components/shift-entry';
import { ShiftExplanation } from './components/shift-explanation';
import { ShiftManagementContainer } from './components/shift-management-container';
import { TAB_KEYS } from './contants/data';
import { useTimeAttendanceTabs } from './hooks/use-time-attendance-tabs';
import { PageFilter } from './components/page-filter';

export const TimeAttendanceManagementTab = () => {
  const { id } = useParams({ strict: false });
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { activeKey } = useTimeAttendanceTabs();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  const { data, isLoading } = useStaffDailyAttendance({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    staffId: id as string,
  });

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <PageFilter showSearch={false} showExplanationType={activeKey === TAB_KEYS.SHIFT_EXPLANATION} />
      </div>
      <Header />
      {TAB_KEYS.WORKSHEET_BY_SHIFT === activeKey && (
        <div className="space-y-4">
          <AttendanceSummary data={data?.data?.[0]?.summary} />
          <div className="overflow-auto space-y-4 py-2 h-[calc(100vh-503px)]">
            {data?.data?.[0]?.days?.map((shift, idx) => (
              <ShiftEntry key={idx} {...shift} />
            ))}
          </div>
        </div>
      )}
      {TAB_KEYS.SHIFT_EXPLANATION === activeKey && <ShiftExplanation />}
      {TAB_KEYS.SHIFT_ASSIGNMENT === activeKey && <ShiftManagementContainer />}
    </div>
  );
};
