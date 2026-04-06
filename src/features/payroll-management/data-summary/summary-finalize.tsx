import { useCallback, useEffect, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useConfirmStore } from '@/store/useConfirmStore';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { TitlePage } from '@/components/title-page';

import { ActionBanner } from '../components/action-banner';
import { CostItem } from '../components/cost-item';
import { SectionCardOtherIncome } from '../components/section-card-other-income';
import { StatItem } from '../components/stat-item';
import { SummaryFinalizeMonthFilter } from '../components/summary-finalize-month-filter';
import {
  useCalculateMutation,
  usePayrollSummary,
  usePayrollSummaryLatest,
  useSaveDraftMutation,
} from '../hooks/use-payroll-management';
import { LoadingWrapper } from '@/components/loading-wrapper';

const COST_DOT_COLORS = {
  gross: '#000000',
  bonus: '#17C964',
  penalty: '#F31260',
  payout: '#6576FF',
} as const;

const formatVND = (amount: number): string => `${amount.toLocaleString('vi-VN')} đ`;

const formatSignedVND = (amount: number): string => `${amount > 0 ? '+' : ''} ${formatVND(amount)}`;

const StatSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    <div className="h-4 w-20 rounded bg-gray-200" />
    <div className="h-6 w-28 rounded bg-gray-200" />
  </div>
);

const CostSkeleton = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="h-2 w-2 rounded-full bg-gray-200 shrink-0" />
    <div className="space-y-2 flex-1">
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="h-6 w-36 rounded bg-gray-200" />
    </div>
  </div>
);

export const SummaryFinalize = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { filters, setFilter } = useQueryFilter<RequestsParams>();
  const month = (filters.month as string) ?? dayjs().format('YYYY-MM');
  const open = useConfirmStore((state) => state.open);

  const { data, isLoading } = usePayrollSummary(month);
  const { data: dataLatest, isLoading: isLoadingLatest } = usePayrollSummaryLatest();

  const { mutate: mutateCalculate, isPending: isPendingCalculate } = useCalculateMutation(month);
  const { mutate: mutateDraft, isPending: isPendingSaveDraft } = useSaveDraftMutation(month);

  useEffect(() => {
    if (dataLatest) {
      setFilter('month', dataLatest.month)
    }
  }, [dataLatest])

  const handleSaveDraft = () => {
    mutateDraft({ month });
  };

  const calculate = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        mutateCalculate(
          { month },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          },
        );
      }),
    [month, mutateCalculate],
  );

  const handleClickTransfer = useCallback(() => {
    open(
      {
        title: 'Xác nhận chốt kỳ lương',
        description:
          'Sau khi xác nhận, hệ thống sẽ tính toán và chốt dữ liệu lương kỳ này. Hành động không thể hoàn tác.',
        confirmLabel: 'Xác nhận',
        confirmColor: 'primary',
        requireReason: false,
      },
      calculate,
    );
  }, [calculate, open]);

  return (
    <LoadingWrapper isLoading={isLoadingLatest} height='50vh'>
      <div className="space-y-6">
        <div className="flex items-center justify-between pr-20">
          <TitlePage title={t('summary-finalize.title')} />
          <SummaryFinalizeMonthFilter />
        </div>
        <div className="bg-white rounded-xl space-y-6 p-6">
          <SectionCardOtherIncome
            title={t('summary-finalize.input-summary.title', 'Tổng hợp và chốt đầu vào kỳ lương')}
          >
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              ) : (
                <>
                  {/* <StatItem
                    label={t('summary-finalize.input-summary.attendance', 'Chấm công')}
                    value={data?.inputs.attendance ?? '-'}
                  /> */}
                  <StatItem
                    label={t('summary-finalize.input-summary.revenue', 'Doanh số')}
                    value={data?.inputs.revenue != null ? formatVND(data.inputs.revenue) : '-'}
                  />
                  <StatItem
                    label={t('summary-finalize.input-summary.kpi', 'Điểm KPI')}
                    value={data?.inputs.kpiPoint != null ? String(data.inputs.kpiPoint) : '-'}
                  />
                  <StatItem
                    label={t('summary-finalize.input-summary.other', 'Khoản khác')}
                    value={
                      data?.inputs.otherIncomeCount != null
                        ? String(data.inputs.otherIncomeCount)
                        : '-'
                    }
                  />
                </>
              )}
            </div>
          </SectionCardOtherIncome>
          <SectionCardOtherIncome
            title={t('summary-finalize.cost-estimate.title', 'Ước tính tổng chi phí kỳ lương')}
          >
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <CostSkeleton key={i} />)
              ) : (
                <>
                  <CostItem
                    dotColor={COST_DOT_COLORS.gross}
                    label={t('summary-finalize.cost-estimate.gross', 'Tổng lương Gross')}
                    value={
                      data?.costs.totalGrossSalary != null
                        ? formatVND(data.costs.totalGrossSalary)
                        : '-'
                    }
                    valueClassName="text-gray-900"
                  />
                  <CostItem
                    dotColor={COST_DOT_COLORS.bonus}
                    label={t('summary-finalize.cost-estimate.bonus', 'Tổng thưởng')}
                    value={
                      data?.costs.totalBonus != null ? formatSignedVND(data.costs.totalBonus) : '-'
                    }
                    valueClassName="text-green-600"
                  />
                  <CostItem
                    dotColor={COST_DOT_COLORS.penalty}
                    label={t('summary-finalize.cost-estimate.penalty', 'Tổng phạt')}
                    value={
                      data?.costs.totalPenalty != null ? formatVND(data.costs.totalPenalty) : '-'
                    }
                    valueClassName="text-red-500"
                  />
                  <CostItem
                    dotColor={COST_DOT_COLORS.payout}
                    label={t('summary-finalize.cost-estimate.payout', 'Chi trả ước tính')}
                    value={
                      data?.costs.estimatedTotalPay != null
                        ? formatVND(data.costs.estimatedTotalPay)
                        : '-'
                    }
                    valueClassName="text-blue-600"
                  />
                </>
              )}
            </div>
          </SectionCardOtherIncome>
          <ActionBanner
            t={t}
            onSaveDraft={handleSaveDraft}
            onTransfer={handleClickTransfer}
            isTransferring={isPendingCalculate}
            data={data}
          />
        </div>
      </div>
    </LoadingWrapper>
  );
};
