import { useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button } from '@heroui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { ShiftManagementParams } from '@/types';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { calcStandardWorkingDays, getAttendanceCycleDates } from '../../hooks/use-attendance-cycle';
import { useConfiguration, useCraetePeriodsMutation } from '../../hooks/use-timekeeping-management';
import { useTimekeepingTranslation } from '../../hooks/use-timekeeping-translation';

type PeriodPayload = {
  name: string;
  fromDate: string;
  toDate: string;
  standardWorkingDays: number;
};

function useAttendancePeriod(month: number, year: number, cycleStartDate: number): PeriodPayload {
  return useMemo(() => {
    const { fromDate, toDate } = getAttendanceCycleDates(month, year, cycleStartDate);
    return {
      name: `Tháng ${month}/${year}`,
      fromDate: dayjs(fromDate).format('YYYY-MM-DD'),
      toDate: dayjs(toDate).format('YYYY-MM-DD'),
      standardWorkingDays: calcStandardWorkingDays(fromDate, toDate),
    };
  }, [month, year, cycleStartDate]);
}

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

  const open = useConfirmStore((state) => state.open);
  const navigate = useNavigate();
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { mutate, isPending } = useCraetePeriodsMutation();

  const { data: configData } = useConfiguration();
  const cycleStartDate = configData?.data?.attendanceCycleStartDate ?? 1;

  const [year, month] = useMonthYear(filters.month);
  // const payload = useAttendancePeriod(month, year, cycleStartDate);

  const payload = useMemo(() => {
    return {
      month: dayjs(filters.month ?? undefined).format('YYYY-MM'),
    };
  }, [filters.month]);

  const createPeriod = useCallback(
    () =>
      new Promise<void>((resolve) => {
        mutate(payload, {
          onSuccess: () => resolve(),
          onError: () => resolve(),
        });
      }),
    [mutate, payload],
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
  }, [open, t, month, year, tc, createPeriod]);

  const handleNavigatePayroll = useCallback(() => {
    navigate({ to: '/admin/payroll-management/payroll-calculation' });
  }, [navigate]);

  return (
    <div className="flex items-center gap-3">
      <Button
        onPress={handleApproveBrowse}
        color="primary"
        isLoading={isPending}
        isDisabled={isPending}
      >
        {t('attendance.approve_btn')}
      </Button>

      <Button onPress={handleNavigatePayroll} color="secondary">
        {t('attendance.navigate_payroll_btn')}
      </Button>
    </div>
  );
}
