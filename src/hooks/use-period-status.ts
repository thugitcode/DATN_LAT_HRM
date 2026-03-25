import { usePayrollPeridStatus } from '@/features/payroll-management/hooks/use-payroll-management';
import { PeriodStatusEnum } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

export const usePeriodStatus = (month: string) => {
  const { data, isLoading, isError } = usePayrollPeridStatus(month);

  const periodStatus = data?.data?.period?.status;

  const isLocked = isError ? false : periodStatus !== PeriodStatusEnum.DRAFT;
  const isDraff = isError ? false : periodStatus === PeriodStatusEnum.DRAFT;
  const isPublished = isError ? false : periodStatus === PeriodStatusEnum.PUBLISHED;
  const isLock = isError ? false : periodStatus === PeriodStatusEnum.LOCK;

  return { periodStatus, isLocked, isDraff, isLoading, isPublished, isLock };
};
