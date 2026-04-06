import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { IconArrowLeft, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { renderStatusChip } from '@/features/staff-management/staff-list-management/hooks/use-staff-columns';
import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';
import { usePayrollCalculationList } from '../../hooks/use-payroll-calculation';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import type { ShiftManagementParams } from '@/types';
import { PayslipChannelEnum, type SendPayslipPayload, type StaffPayroll } from '../../types/payroll-caculation.type';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { icons } from '@/lib/icons';
import { useConfirmStore } from '@/store/useConfirmStore';
import { useSendPayslips } from '../../hooks/useSendPayslips';

const toStaffTimeKeeping = (p: StaffPayroll): StaffTimeKeeping => ({
  id: p.staffId,
  code: p.staffCode,
  name: p.staffName,
  avatar: p.avatar,
  departments: p.departments as any,
  rooms: p.rooms as any,
  position: p.position,
  status: p.staffStatus,
});

export const PageHeader = ({
  handleBack,
  onPrint,
  ...props
}: {
  handleBack?: () => void;
  onPrint?: () => void;
  handleNext?: () => void;
  handlePrev?: () => void;
}) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { t: tPayroll } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { data: staffId } = useDrawer();
  const { staffId: staffIdRoute } = useSearch({
    from: '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id',
  });
  const navigate = useNavigate();
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const open = useConfirmStore((state) => state.open);
  const [currentStaff, setCurrentStaff] = useState<StaffTimeKeeping | undefined>(undefined);

  const { mutate } = useSendPayslips();

  const { data: list } = usePayrollCalculationList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    search: filters.search,
    month: filters.month ?? dayjs().format('YYYY-MM'),
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    view: 'result',
  });

  const payrollList = list?.data?.data ?? [];

  useEffect(() => {
    const payroll = payrollList.find((p) => p.staffId === staffId || p.staffId === staffIdRoute);
    if (payroll) setCurrentStaff(toStaffTimeKeeping(payroll));
  }, [payrollList]);

  const currentIndex = useMemo(
    () => payrollList.findIndex((p) => p.staffId === currentStaff?.id) ?? 0,
    [payrollList, currentStaff],
  );

  const handleNext = () => {
    const next = payrollList[currentIndex + 1];
    if (next) {
      setCurrentStaff(toStaffTimeKeeping(next));
      navigate({
        from: '/admin/payroll-management/payroll-calculation/$id',
        search: { staffId: next.staffId, month: filters.month },
      });
      props?.handleNext?.();
    }
  };

  const handlePrev = () => {
    const prev = payrollList[currentIndex - 1];
    if (prev) {
      setCurrentStaff(toStaffTimeKeeping(prev));
      navigate({
        from: '/admin/payroll-management/payroll-calculation/$id',
        search: { staffId: prev.staffId, month: filters.month },
      });
      props?.handlePrev?.();
    }
  };
  const monthQuery = dayjs(filters.month ?? undefined).format('YYYY-MM');

  const payload: SendPayslipPayload = useMemo(() => {
    return {
      month: monthQuery,
      channel: PayslipChannelEnum.APP,
      staffIds: [currentStaff?.id as string],
    };
  }, [currentStaff?.id, monthQuery]);

  const send = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        mutate(payload, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      }),
    [payload, mutate],
  );

  const handleClickSend = useCallback(() => {
    open(
      {
        title: tPayroll('payrollCalculation.sendPayslip.title'),
        description: tPayroll('payrollCalculation.sendPayslip.descriptionStaff', { name: currentStaff?.name }),
        confirmColor: 'primary',
        requireReason: false,
        confirmLabel: tPayroll('payrollCalculation.sendPayslip.confirmLabel'),
      },
      send,
    );
  }, [open, send, tPayroll, currentStaff?.name]);
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
            isDisabled={currentIndex <= 0}
          >
            <IconChevronLeft size={20} />
          </Button>

          <Button
            isIconOnly
            className="bg-white"
            radius="full"
            onPress={handleNext}
            isDisabled={currentIndex >= payrollList.length - 1}
          >
            <IconChevronRight size={20} />
          </Button>
        </div>
        <span className="text-sm font-medium">
          {currentIndex + 1} / {list?.data?.pagination?.total || payrollList.length} {t('staff')}
        </span>
        <Button
          color="primary"
          onPress={handleClickSend}
        >
          {icons.send}
          {tPayroll('payrollCalculation.sendPayslip.title')}
        </Button>
      </div>
    </div>
  );
};
