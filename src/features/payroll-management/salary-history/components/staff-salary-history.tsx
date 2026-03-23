import { useMemo } from 'react';

import type { Staff } from '@/types/shift-management.type';

import { useStaffSalary } from '../../hooks/use-payroll-management';
import { EmptyState } from './empty-state';
import { SalaryHeader } from './salary-header';
import { SalaryHistoryRow } from './salary-history-row';
import { SkeletonRowSalaryHistory } from './skeleton-row-salary-history';

type StaffSalaryHistoryProps = {
  staff: Staff | null;
};

export const StaffSalaryHistory = ({ staff }: StaffSalaryHistoryProps) => {
  const { data, isLoading } = useStaffSalary(staff?.id ?? '');

  const salaryList = data?.data ?? [];

  const { latestSalary, latestDelta } = useMemo(() => {
    if (!salaryList.length) return { latestSalary: 0, latestDelta: 0 };
    const latest = salaryList[0];
    const prev = salaryList[1] ?? null;
    return {
      latestSalary: latest.netPay,
      latestDelta: prev ? latest.netPay - prev.netPay : 0,
    };
  }, [salaryList]);

  if (!staff) return <EmptyState message="Chọn nhân viên để xem lịch sử lương" />;

  return (
    <div className="flex-1 flex flex-col border border-gray-100 rounded-2xl bg-white overflow-hidden">
      <SalaryHeader staff={staff} latestSalary={latestSalary} delta={latestDelta} />

      <div className="flex-1 overflow-y-auto px-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRowSalaryHistory key={i} />)
        ) : !salaryList.length ? (
          <EmptyState message="Chưa có lịch sử lương" />
        ) : (
          salaryList.map((item, i) => (
            <SalaryHistoryRow
              key={item.id}
              item={item}
              prevNetPay={salaryList[i + 1]?.netPay ?? null}
            />
          ))
        )}
      </div>
    </div>
  );
};
