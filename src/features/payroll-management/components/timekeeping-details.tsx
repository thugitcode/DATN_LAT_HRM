import { useEffect, useMemo, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Avatar, Button, Chip, Skeleton } from '@heroui/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next'; // Giả định bạn dùng thư viện này

import type { ShiftManagementParams } from '@/types';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import AttendanceSummary from '@/features/staff-management/time-attendance-management/components/attendance-summary';
import { Header } from '@/features/staff-management/time-attendance-management/components/header';
import { ShiftEntry } from '@/features/staff-management/time-attendance-management/components/shift-entry';
import { ShiftExplanation } from '@/features/staff-management/time-attendance-management/components/shift-explanation';
import { ShiftManagementContainer } from '@/features/staff-management/time-attendance-management/components/shift-management-container';
import { TAB_KEYS } from '@/features/staff-management/time-attendance-management/contants/data';
import { useTimeAttendanceTabs } from '@/features/staff-management/time-attendance-management/hooks/use-time-attendance-tabs';
import { useStaffDailyAttendance } from '@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management';
import { useAttendanceTable } from '@/features/timekeeping-shift-scheduling/timekeeping-management/hooks/use-timekeeping-management';
import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

export const TimekeepingDetails = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { data: staffId } = useDrawer();
  const { data: listStaff, isLoading: loadingList } = useAttendanceTable({ getAll: true });
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { activeKey } = useTimeAttendanceTabs();

  const { startDate, endDate } = useMonthDateRange(filters.month);

  // Khởi tạo staff hiện tại
  const [currentStaff, setCurrentStaff] = useState<StaffTimeKeeping>();
  useEffect(() => {
    const staff = listStaff?.data?.find((ite) => ite.staff.id === staffId)?.staff;
    staff && setCurrentStaff(staff);
  }, [listStaff?.data]);
  const currentIndex = useMemo(
    () => listStaff?.data?.findIndex((it) => it.staff.id === currentStaff?.id) ?? 0,
    [listStaff, currentStaff],
  );

  const { data: details, isLoading } = useStaffDailyAttendance({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    staffId: currentStaff?.id as string,
  });

  const handleNext = () => {
    if (currentIndex < (listStaff?.data?.length ?? 0) - 1) {
      setCurrentStaff(listStaff?.data?.[currentIndex + 1]?.staff);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentStaff(listStaff?.data?.[currentIndex - 1]?.staff);
    }
  };

  return (
    <div className="flex flex-col p-6">
      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={
                  currentStaff?.avatar ||
                  `https://ui-avatars.com/api/?name=${currentStaff?.name}&background=random`
                }
                className="w-12 h-12"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#11181C]">{currentStaff?.name}</h1>
                  <Chip
                    size="sm"
                    color={currentStaff?.status === 'WORKING' ? 'success' : 'danger'}
                    variant="flat"
                    className="h-5"
                  >
                    {currentStaff?.status === 'WORKING' ? t('status.working') : t('status.off')}
                  </Chip>
                </div>
                <p className="text-sm text-[#71717A] mt-0.5">{currentStaff?.code}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                isIconOnly
                className="bg-white border"
                radius="full"
                onPress={handlePrev}
                isDisabled={currentIndex === 0}
              >
                <IconChevronLeft size={20} />
              </Button>

              <Button
                isIconOnly
                className="bg-white border"
                radius="full"
                onPress={handleNext}
                isDisabled={currentIndex === (listStaff?.data?.length ?? 0) - 1}
              >
                <IconChevronRight size={20} />
              </Button>
            </div>
            <span className="text-sm font-medium">
              {currentIndex + 1} / {listStaff?.pagination?.total || 0} {t('staff')}
            </span>
          </div>
        </div>
      </div>

      <Header />

      <div className="space-y-4">
        {loadingList ? (
          <Skeleton className="rounded-lg h-40" />
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
