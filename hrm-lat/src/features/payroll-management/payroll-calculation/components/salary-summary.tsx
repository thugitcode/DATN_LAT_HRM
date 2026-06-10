'use client';

import { NAMESPACES } from '@/i18n/constants';
import { Divider } from '@heroui/react';
import { IconBuildingBridge2, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';
import { calculateEmployerContributions, formatCurrency, formatDate } from '@/lib/utils';

import type { SalaryData } from '../../types/payroll-caculation.type';

interface SalarySummaryProps {
  data: SalaryData;
}

interface SummaryRowProps {
  label: string;
  value: string | number;
  isAmount?: boolean;
  formatCurrency?: (amount: number) => string;
}

function SummaryRow({ label, value, isAmount = false, formatCurrency }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-[#52525B]">{label}</span>
      <span className="text-sm font-medium">
        {isAmount && typeof value === 'number' && formatCurrency ? formatCurrency(value) : value}
      </span>
    </div>
  );
}

export function SalarySummary({ data }: SalarySummaryProps) {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const employerContributions = calculateEmployerContributions(data);

  // Extract month/year from monthLabel
  const monthYear = data.monthLabel.replace('PHIẾU LƯƠNG ', '').replace('SALARY SLIP ', '');
  return (
    <div className="rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#6576FF] px-6 py-3">
        <h3 className="text-white font-medium leading-7 text-lg uppercase">
          {t('payrollCalculation.detail.summaryTitle')} {monthYear}
        </h3>
      </div>

      {/* Summary Content */}
      <div className="px-6 py-3 bg-white rounded-b-xl">
        <SummaryRow
          label={t('payrollCalculation.detail.fromDate')}
          value={formatDate(data.fromDate)}
        />
        <SummaryRow label={t('payrollCalculation.detail.toDate')} value={formatDate(data.toDate)} />
        <SummaryRow
          label={t('payrollCalculation.detail.standardWorkDays')}
          value={`${data.workDays
            } ${t('payrollCalculation.detail.days')}`}
        />
        <SummaryRow
          label={t('payrollCalculation.detail.actualWorkDays')}
          value={`${data.totalAttendance} ${t('payrollCalculation.detail.days')}`}
        />
        <SummaryRow
          label={t('payrollCalculation.detail.paidLeave')}
          value={`${data.paidLeave} ${t('payrollCalculation.detail.days')}`}
        />
        <SummaryRow
          label={t('payrollCalculation.detail.onCallDays')}
          value={`${data.onCallDays} ${t('payrollCalculation.detail.days')}`}
        />
        <SummaryRow
          label={t('payrollCalculation.detail.overtime')}
          value={`${data.totalOvertimeHours} ${t('payrollCalculation.detail.hours')}`}
        />

        <Divider className="my-3 bg-gray-600" />

        {/* Leave Info */}
        <div className="mb-3">
          {/* <div className="flex items-center gap-2 mb-2">
                        <IconCalendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">{t("payrollCalculation.detail.leaveInfo")}</span>
                    </div> */}
          <SummaryRow
            label={t('payrollCalculation.detail.totalLeaveDays')}
            value={`${data.totalLeaveDays} ${t('payrollCalculation.detail.days')}`}
          />
          <SummaryRow
            label={t('payrollCalculation.detail.usedLeaveDays')}
            value={`${data.usedLeaveDays} ${t('payrollCalculation.detail.days')}`}
          />
          <SummaryRow
            label={t('payrollCalculation.detail.remainingLeaveDays')}
            value={`${data.remainingLeaveDays} ${t('payrollCalculation.detail.days')}`}
          />
        </div>

        <Divider className="my-3 bg-gray-600" />

        <SummaryRow
          label={t('payrollCalculation.detail.totalGross')}
          value={data.totalBeforeDeduction}
          isAmount
          formatCurrency={formatCurrency}
        />
        <SummaryRow
          label={t('payrollCalculation.detail.employeeContribution')}
          value={data.totalDeduction}
          isAmount
          formatCurrency={formatCurrency}
        />
        <SummaryRow
          label={t('payrollCalculation.detail.taxPIT')}
          value={data.personalIncomeTax}
          isAmount
          formatCurrency={formatCurrency}
        />
        <SummaryRow
          label={t('payrollCalculation.detail.advancePayment')}
          value={data.advancePayment}
          isAmount
          formatCurrency={formatCurrency}
        />

        {/* Net Income Highlight */}
        <div className="mt-4 bg-[#E6F1FE] rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#6576FF]">
              {icons.moneyBag}
              <span className="font-medium text-base">
                {t('payrollCalculation.detail.totalNetIncome')}
              </span>
            </div>
            <span className="text-xl font-medium text-[#6576FF]">
              {formatCurrency(data.finalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Employer Contribution Section */}
      <div className="bg-white mt-4">
        <div className="flex items-center gap-2 px-6 py-3 rounded-t-lg bg-[#002E62]">
          <h3 className="text-white font-semibold text-sm">
            {t('payrollCalculation.detail.employerContributionTitle')}
          </h3>
        </div>

        <div className="space-y-1 px-6 py-3">
          <SummaryRow
            label={t('payrollCalculation.detail.socialInsurance') + " (17.5%)"}
            value={data.employerSocialInsurance}
            isAmount
            formatCurrency={formatCurrency}
          />
          <SummaryRow
            label={t('payrollCalculation.detail.healthInsurance') + " (3%)"}
            value={data.employerHealthInsurance}
            isAmount
            formatCurrency={formatCurrency}
          />
          <SummaryRow
            label={t('payrollCalculation.detail.unemploymentInsurance') + " (1%)"}
            value={data.employerUnemploymentInsurance}
            isAmount
            formatCurrency={formatCurrency}
          />
          <SummaryRow
            label={t('payrollCalculation.detail.employerUnionFee') + " (2%)"}
            value={data.employerUnionFee}
            isAmount
            formatCurrency={formatCurrency}
          />
          {/* Total Employer Cost */}
          <div className="mt-4 bg-[#F4F4F5] rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#002E62]">
                {icons.moneyBag}
                <span className="text-lg font-medium">
                  {t('payrollCalculation.detail.totalEmployerCost')}
                </span>
              </div>
              <span className="text-xl font-medium text-[#002E62]">
                {formatCurrency(data.employerTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
