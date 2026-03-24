import { Skeleton } from '@heroui/react';
import { useState } from 'react';

import AttendanceSummary from '@/features/staff-management/time-attendance-management/components/attendance-summary';
import { Header as TabsHeader } from '@/features/staff-management/time-attendance-management/components/header';
import { ShiftEntry } from '@/features/staff-management/time-attendance-management/components/shift-entry';
import { ShiftExplanation } from '@/features/staff-management/time-attendance-management/components/shift-explanation';
import { ShiftManagementContainer } from '@/features/staff-management/time-attendance-management/components/shift-management-container';
import { TAB_KEYS } from '@/features/staff-management/time-attendance-management/contants/data';
import { useTimeAttendanceTabs } from '@/features/staff-management/time-attendance-management/hooks/use-time-attendance-tabs';
import { useStaffDailyAttendance } from '@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management';
import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import type { ShiftManagementParams } from '@/types';
import { PageHeader } from './page-header';

export const TimekeepingDetails = () => {

  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { activeKey } = useTimeAttendanceTabs();

  const { startDate, endDate } = useMonthDateRange(filters.month);
  const [currentStaff, setCurrentStaff] = useState<StaffTimeKeeping>();


  const { data: details, isLoading } = useStaffDailyAttendance({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    staffId: currentStaff?.id as string,
  });



  return (
    <div className="flex flex-col p-6">
      <div className="mb-5">
        <PageHeader currentStaff={currentStaff} setCurrentStaff={setCurrentStaff} />
      </div>

      <TabsHeader />

      <div className="space-y-4">
        {isLoading ? (
          <Skeleton className="rounded-b-lg p-4" >
            <Skeleton className="rounded-lg h-40 bg-white" />
            <Skeleton className="rounded-lg h-40 bg-white" />
            <Skeleton className="rounded-lg h-40 bg-white" />
            <Skeleton className="rounded-lg h-40 bg-white" />
          </Skeleton>
        ) : (
          <>
            {TAB_KEYS.WORKSHEET_BY_SHIFT === activeKey && (
              <div className="space-y-4">
                <AttendanceSummary data={details?.data?.[0]?.summary} />

                <div className="overflow-auto space-y-4 py-2 h-[calc(100vh-375px)]">
                  {details?.data?.[0]?.days?.map((shift, idx) => (
                    <ShiftEntry key={idx} {...shift} />
                  ))}
                </div>
              </div>
            )}
            {TAB_KEYS.SHIFT_EXPLANATION === activeKey && (
              <ShiftExplanation staffId={currentStaff?.id} />
            )}
            {TAB_KEYS.SHIFT_ASSIGNMENT === activeKey && (
              <ShiftManagementContainer staffId={currentStaff?.id} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
