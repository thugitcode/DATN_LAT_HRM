import { useEffect, useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button, Chip } from '@heroui/react';
import { IconArrowLeft, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { useAttendanceTable } from '@/features/timekeeping-shift-scheduling/timekeeping-management/hooks/use-timekeeping-management';
import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';
import { useStaffList } from '@/hooks/queries/use-staff-query';
import { renderStatusChip } from '@/features/staff-management/staff-list-management/hooks/use-staff-columns';

export const PageHeader = ({
  currentStaff,
  setCurrentStaff,
  handleBack,
  onPrint,
}: {
  currentStaff: StaffTimeKeeping | undefined;
  setCurrentStaff: (staff: StaffTimeKeeping) => void;
  handleBack?: () => void;
  onPrint?: () => void;
}) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { data: staffId } = useDrawer();
  const { data: listStaff, isLoading: loadingList } = useStaffList({ getAll: true });
  // Khởi tạo staff hiện tại
  useEffect(() => {
    const staff = listStaff?.data?.find((ite) => ite.id === staffId);
    staff && setCurrentStaff(staff);
  }, [listStaff?.data]);
  const currentIndex = useMemo(
    () => listStaff?.data?.findIndex((it) => it.id === currentStaff?.id) ?? 0,
    [listStaff, currentStaff],
  );
  const handleNext = () => {
    const nextStaff = listStaff?.data?.[currentIndex + 1];
    if (nextStaff) {
      setCurrentStaff(nextStaff);
    }
  };

  const handlePrev = () => {
    const prevStaff = listStaff?.data?.[currentIndex - 1];
    if (prevStaff) {
      setCurrentStaff(prevStaff);
    }
  };

  const handleClickPrint = () => {
    onPrint?.();
  };
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {handleBack && (
            <Button className="rounded-full" isIconOnly onPress={handleBack}>
              <IconArrowLeft color="#52525B" />
            </Button>
          )}
          <StaffAvatar avatarUrl={currentStaff?.avatar} name={currentStaff?.name} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#11181C]">{currentStaff?.name}</h1>
              {renderStatusChip(currentStaff?.status as any, t)}
            </div>
            <p className="text-sm text-[#71717A] mt-0.5">{currentStaff?.code}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          <Button
            isIconOnly
            className="bg-white"
            radius="full"
            onPress={handlePrev}
            isDisabled={currentIndex === 0}
          >
            <IconChevronLeft size={20} />
          </Button>

          <Button
            isIconOnly
            className="bg-white"
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

      {/* <Button color="primary" className="h-8" onPress={handleClickPrint}>
        In phiếu lương
      </Button> */}
    </div>
  );
};
