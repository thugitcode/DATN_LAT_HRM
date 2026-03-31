import { useState } from 'react';

import type { ShiftManagementParams } from '@/types';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import AttendanceSummary from '@/features/staff-management/time-attendance-management/components/attendance-summary';
import { Header as TabsHeader } from '@/features/staff-management/time-attendance-management/components/header';
import { ShiftEntry } from '@/features/staff-management/time-attendance-management/components/shift-entry';
import { ShiftExplanation } from '@/features/staff-management/time-attendance-management/components/shift-explanation';
import { ShiftManagementContainer } from '@/features/staff-management/time-attendance-management/components/shift-management-container';
import { TAB_KEYS } from '@/features/staff-management/time-attendance-management/contants/data';
import { useTimeAttendanceTabs } from '@/features/staff-management/time-attendance-management/hooks/use-time-attendance-tabs';
import { useStaffDailyAttendance } from '@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management';
import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { PageHeader } from './page-header';
import type { StaffAttendanceRecord } from '@/features/staff-management/types/types';
import { TimekeepingDetailSkeleton } from './timekeeping-details-skeleton';

const DEFAULT_PAGE_LIMIT = 10;

interface WorksheetTabProps {
  summary?: StaffAttendanceRecord['summary'];
  days?: StaffAttendanceRecord['days'];
}

const WorksheetTab = ({ summary, days }: WorksheetTabProps) => {
  return (
    <div className="space-y-4 ">
      <AttendanceSummary data={summary} />
      <div className="overflow-auto space-y-4 py-2 h-[calc(100vh-260px)]">
        {days?.map((shift, idx) => (
          <ShiftEntry key={idx} {...shift} />
        ))}
      </div>
    </div>
  );
};

export const TimekeepingDetails = () => {
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { activeKey } = useTimeAttendanceTabs();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  const [currentStaff, setCurrentStaff] = useState<StaffTimeKeeping>();

  const isWorksheetTab = activeKey === TAB_KEYS.WORKSHEET_BY_SHIFT;

  const { data, isLoading } = useStaffDailyAttendance({
    page: 1,
    limit: filters.limit ?? DEFAULT_PAGE_LIMIT,
    fromDate: startDate,
    toDate: endDate,
    staffId: isWorksheetTab ? (currentStaff?.id ?? '') : '',
    enabled: isWorksheetTab && Boolean(currentStaff?.id),
  });

  const firstEntry = data?.data?.[0];

  const renderTabContent = () => {
    switch (activeKey) {
      case TAB_KEYS.WORKSHEET_BY_SHIFT:
        return <WorksheetTab summary={firstEntry?.summary} days={firstEntry?.days} />;
      case TAB_KEYS.SHIFT_EXPLANATION:
        return <ShiftExplanation staffId={currentStaff?.id} />;
      case TAB_KEYS.SHIFT_ASSIGNMENT:
        return <ShiftManagementContainer staffId={currentStaff?.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col p-6">
      <div className="mb-5">
        <PageHeader currentStaff={currentStaff} setCurrentStaff={setCurrentStaff} />
      </div>

      <TabsHeader />

      <div className="space-y-4">
        {isLoading ? <TimekeepingDetailSkeleton /> : renderTabContent()}
      </div>
    </div>
  );
};
