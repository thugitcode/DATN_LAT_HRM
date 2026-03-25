import { NAMESPACES } from '@/i18n/constants';
import { Chip } from '@heroui/react';
import { IconCoinFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { formatCurrency, formatDate } from '@/lib/utils';

import type { SalaryData } from '../../types/payroll-caculation.type';
import { CardHeader } from './card-header';

interface BasicIncomeSectionProps {
  data: SalaryData;
}

interface SalaryRowProps {
  label: string;
  sublabel?: string;
  value: number;
  showFormula?: boolean;
  formulaLabel: string;
  formatCurrency: (amount: number) => string;
}

function SalaryRow({
  label,
  sublabel,
  value,
  showFormula,
  formulaLabel,
  formatCurrency,
}: SalaryRowProps) {
  return (
    <div className="grid grid-cols-3 items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm text-[#52525B]">{label}</p>
        {sublabel && <p className="text-base font-medium">{sublabel}</p>}
      </div>
      <div className="flex justify-center items-start">
        {showFormula && (
          <span className="text-[14px] text-[#52525B] text-center">{formulaLabel}</span>
        )}
      </div>
      <span className="text-base font-medium min-w-[100px] text-right">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function BasicIncomeSection({ data }: BasicIncomeSectionProps) {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <CardHeader
        icon={<IconCoinFilled />}
        title={t('payrollCalculation.detail.basicIncomeTitle')}
        value={data.contractTotalSalary}
      />

      <div className="px-4 py-2">
        <SalaryRow
          label={t('payrollCalculation.detail.contractBasicSalary')}
          sublabel={`${data.actualWorkDays} ${t('payrollCalculation.detail.days')} - ${data.standardWorkingDays} ${t('payrollCalculation.detail.days')}`}
          value={data.actualWorkSalary}
          showFormula
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <SalaryRow
          label={t('payrollCalculation.detail.overtimeSalary')}
          sublabel={`${data.totalOvertimeHours}h OT`}
          value={data.overtimeAmount}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <SalaryRow
          label={t('payrollCalculation.detail.onCallSalary')}
          sublabel={`${data.onCallDays} ${t('payrollCalculation.detail.days')}`}
          value={data.onCallSalary}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <SalaryRow
          label={t('payrollCalculation.detail.production')}
          sublabel={formatDate(data.fromDate)}
          value={0}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
