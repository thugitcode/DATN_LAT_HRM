import { useMemo } from 'react';

import type { Staff } from '@/types/shift-management.type';

import { useStaffSalary } from '../../hooks/use-payroll-management';

// ── Types ────────────────────────────────────────────────────────────────────

interface SalaryHistory {
  id: string;
  basicSalary: number;
  allowanceAmount: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  insuranceAmount: number;
  taxAmount: number;
  netPay: number;
  calculationDetails: unknown;
  isPaid: boolean;
  paidAt: Date;
  payrollPeriod: {
    name: string;
    fromDate: Date;
    toDate: Date;
    standardWorkingDays: number;
    status: unknown;
    note: string;
  };
}

type StaffSalaryHistoryProps = {
  staff: Staff | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(date),
  );

// ── Sub-components ────────────────────────────────────────────────────────────

const SalaryDelta = ({ amount }: { amount: number }) => {
  if (amount === 0) return null;
  const isPositive = amount > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        isPositive ? 'text-emerald-500' : 'text-red-500'
      }`}
    >
      {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}
      {formatVND(amount)}
    </span>
  );
};

const SalaryHistoryRow = ({
  item,
  prevNetPay,
  createdBy = 'Nguyễn Thị HR',
}: {
  item: SalaryHistory;
  prevNetPay: number | null;
  createdBy?: string;
}) => {
  const delta = prevNetPay !== null ? item.netPay - prevNetPay : 0;

  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-gray-800">
          {formatDate(item.payrollPeriod.fromDate)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Được tạo bởi: {createdBy}</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800">{item.payrollPeriod.name}</p>
        {item.payrollPeriod.note && (
          <p className="text-sm text-gray-600">{item.payrollPeriod.note}</p>
        )}
        <p className="text-sm text-gray-500">Phê duyệt bởi: Ban Giám đốc.</p>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span>{formatVND(item.basicSalary)}</span>
          <span className="text-gray-300">→</span>
          <span>{formatVND(item.netPay)}</span>
          {delta !== 0 && <SalaryDelta amount={delta} />}
        </div>
      </div>
    </div>
  );
};

const SalaryHeader = ({
  staff,
  latestSalary,
  delta,
}: {
  staff: Staff;
  latestSalary: number;
  delta: number;
}) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
    {/* Staff info */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
        {staff.avatar ? (
          <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500">
            {staff.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{staff.name}</p>
        <p className="text-xs text-gray-400">
          {staff.code} · {staff.position}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
      <span className="text-xs text-gray-500 font-medium">Lương hiện tại:</span>
      <span className="text-base font-bold text-blue-600">{formatVND(latestSalary)}</span>
      {delta !== 0 && <SalaryDelta amount={delta} />}
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex-1 flex items-center justify-center text-sm text-gray-400">{message}</div>
);

const SkeletonRow = () => (
  <div className="grid grid-cols-[140px_1fr] gap-4 py-4 border-b border-gray-100 animate-pulse">
    <div className="space-y-2">
      <div className="h-3.5 w-24 bg-gray-100 rounded" />
      <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-3.5 w-48 bg-gray-100 rounded" />
      <div className="h-3 w-64 bg-gray-100 rounded" />
      <div className="h-3 w-40 bg-gray-100 rounded" />
    </div>
  </div>
);

export const StaffSalaryHistory = ({ staff }: StaffSalaryHistoryProps) => {
  const { data, isLoading } = useStaffSalary(staff?.id ?? '');

  const salaryList: SalaryHistory[] = data?.data ?? [];

  // Latest salary + delta vs previous entry
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
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
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
