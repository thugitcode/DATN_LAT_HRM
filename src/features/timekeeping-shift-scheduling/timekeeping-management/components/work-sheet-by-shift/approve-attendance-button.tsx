/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useConfirmStore } from '@/store/useConfirmStore';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import dayjs from 'dayjs';

import type { ShiftManagementParams } from '@/types';
import { icons } from '@/lib/icons';
import { usePeriodStatus } from '@/hooks/use-period-status';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import {
  useCraetePeriodsMutation,
  useLockPeriodsMutation,
  useUnLockPeriodsMutation,
} from '../../hooks/use-timekeeping-management';
import { useTimekeepingTranslation } from '../../hooks/use-timekeeping-translation';

function useMonthYear(rawMonth: string | undefined): [number, number] {
  return useMemo(() => {
    if (rawMonth) {
      const parts = rawMonth.split('-');
      return [Number(parts[0]), Number(parts[1])];
    }
    const now = dayjs();
    return [now.year(), now.month() + 1];
  }, [rawMonth]);
}

export function ApproveAttendanceButton() {
  const { t, tc } = useTimekeepingTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const open = useConfirmStore((state) => state.open);
  const navigate = useNavigate();
  const { filters } = useQueryFilter<ShiftManagementParams>();

  const { month: monthFilter } = filters;

  const monthQuery = dayjs(monthFilter ?? undefined).format('YYYY-MM');

  const { mutate, isPending } = useLockPeriodsMutation(monthQuery);
  const { mutate: mutateUnlock, isPending: isPendingUnlock } = useUnLockPeriodsMutation(monthQuery);

  const { isLocked, isLoading, isDraff, isPublished, isLock } = usePeriodStatus(monthQuery);

  const [year, month] = useMonthYear(monthFilter);

  const payload = useMemo(() => {
    return {
      month: monthQuery,
    };
  }, [monthQuery]);

  const createPeriod = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        mutate(payload, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      }),
    [payload, mutate],
  );

  const handleApproveBrowse = useCallback(() => {
    open(
      {
        title: t('attendance.approve_title'),
        description: t('attendance.approve_desc', { name: `Tháng ${month}/${year}` }),
        confirmLabel: tc('button.confirm'),
        confirmColor: 'primary',
        requireReason: false,
      },
      createPeriod,
    );
  }, [open, t, month, year, tc]);

  const handleUnlock = useCallback(() => {
    open(
      {
        title: 'Hủy duyệt bảng công',
        description: `Bạn có chăc chắn muốn hủy duyệt bảng công Tháng ${month}/${year}`,
        confirmLabel: tc('button.confirm'),
        confirmColor: 'primary',
        requireReason: false,
      },
      () =>
        new Promise<void>((resolve, reject) => {
          mutateUnlock(payload, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
        }),
    );
  }, [open, t, month, year, tc, mutateUnlock, payload]);

  const handleClickGotoPayroll = useCallback(() => {
    if (isLock) {
      navigate({
        to: '/admin/payroll-management/data-summary/summary-finalize',
        search: { month: monthQuery },
      });
    } else {
      onOpen();
    }
  }, [isLock]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-34.5 rounded-xl bg-default-200 animate-pulse" />
        <div className="h-10 w-34.5 rounded-xl bg-default-200 animate-pulse" />
      </div>
    );
  }

  if (isPublished) {
    return (
      <div className="w-50 h-10 rounded-xl bg-[#17C964] text-white inline-flex items-center justify-center text-sm gap-2">
        <icons.tickCircle className="text-white [&>path]:fill-white!" />
        Đã chuyển tính lương
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {isLock ? (
          <Button
            color="danger"
            variant="bordered"
            isLoading={isPendingUnlock}
            isDisabled={isPendingUnlock}
            onPress={handleUnlock}
          >
            Hủy
          </Button>
        ) : (
          <Button
            onPress={handleApproveBrowse}
            color="primary"
            isLoading={isPending}
            isDisabled={isPending}
          >
            {t('attendance.approve_btn')}
          </Button>
        )}

        {isLock && (
          <Button onPress={handleClickGotoPayroll} color="secondary">
            {t('attendance.navigate_payroll_btn')}
          </Button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">⚠️ Chưa duyệt bảng công</ModalHeader>
          <ModalBody>
            <p className="text-default-600 text-sm">
              Tháng{' '}
              <span className="font-semibold text-foreground">
                {month}/{year}
              </span>{' '}
              chưa duyệt bảng công.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
