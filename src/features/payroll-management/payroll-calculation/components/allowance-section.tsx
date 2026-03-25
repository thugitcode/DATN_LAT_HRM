'use client';

import { NAMESPACES } from '@/i18n/constants';
import { Chip } from '@heroui/react';
import { IconGift } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';

import type { SalaryData } from '../../types/payroll-caculation.type';
import { CardHeader } from './card-header';

interface AllowanceSectionProps {
  data: SalaryData;
}

interface AllowanceRowProps {
  label: string;
  value: number;
  showFormula?: boolean;
  formulaLabel: string;
  formatCurrency: (amount: number) => string;
}

function AllowanceRow({
  label,
  value,
  showFormula,
  formulaLabel,
  formatCurrency,
}: AllowanceRowProps) {
  return (
    <div className="grid grid-cols-3 justify-between py-2.5 border-b border-gray-100 last:border-0">
      <p className="text-sm text-gray-700 flex-1">{label}</p>
      <div className="flex justify-center items-start">
        {showFormula && (
          <span className="text-[14px] text-[#52525B] text-center">{formulaLabel}</span>
        )}
      </div>
      <span className="text-sm font-medium text-gray-900 min-w-[100px] text-right">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function AllowanceSection({ data }: AllowanceSectionProps) {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const totalAllowance =
    (data.responsibilityAllowance || 0) +
    (data.hazardAllowance || 0) +
    (data.positionAllowance || 0) +
    (data.mealAllowance || 0) +
    (data.phoneAllowance || 0) +
    (data.fuelAllowance || 0) +
    (data.businessTripAllowance || 0) +
    (data.otherAllowance || 0) +
    (data.performanceSalary || 0) +
    (data.bonusAmount || 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <CardHeader
        icon={icons.gift}
        title={t('payrollCalculation.detail.allowance_title')}
        value={totalAllowance}
      />

      <div className="px-4 py-2">
        <AllowanceRow
          label={t('payrollCalculation.detail.responsibility_allowance')}
          value={data.responsibilityAllowance}
          showFormula
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.hazard_allowance')}
          value={data.hazardAllowance}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.position_allowance')}
          value={data.positionAllowance}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.meal_allowance')}
          value={data.mealAllowance}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.phone_allowance')}
          value={data.phoneAllowance}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.fuel_allowance')}
          value={data.fuelAllowance}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.business_trip_allowance')}
          value={data.businessTripAllowance}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.performance_salary')}
          value={data.performanceSalary}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.bonus_amount')}
          value={data.bonusAmount}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
        <AllowanceRow
          label={t('payrollCalculation.detail.other_allowance')}
          value={data.otherAllowance}
          formulaLabel={t('payrollCalculation.detail.formula')}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
