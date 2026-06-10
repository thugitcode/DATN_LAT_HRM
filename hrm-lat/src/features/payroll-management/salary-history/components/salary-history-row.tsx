import { formatDate, formatVND } from '@/lib/helpers';

import type { SalaryHistory } from '../../types/salary-history.type';
import { SalaryDelta } from './salary-delta';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

export const SalaryHistoryRow = ({
  item,
  prevNetPay,
  createdBy = 'Nguyễn Thị HR',
}: {
  item: SalaryHistory;
  prevNetPay: number | null;
  createdBy?: string;
}) => {
  const delta = prevNetPay !== null ? item.netPay - prevNetPay : 0;
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT)
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-gray-800">
          {formatDate(item.payrollPeriod.fromDate)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{t('salary-history.created_by')}: {createdBy}</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800">{item.payrollPeriod.name}</p>
        {item.payrollPeriod.note && (
          <p className="text-sm text-gray-600">{item.payrollPeriod.note}</p>
        )}
        <p className="text-sm text-gray-500">{t('salary-history.approved_by')}: Ban Giám đốc.</p>
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
