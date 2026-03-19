import { useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { TitlePage } from '@/components/title-page';

import { ActionBanner } from '../components/action-banner';
import { CostItem } from '../components/cost-item';
import { SectionCardOtherIncome } from '../components/section-card-other-income';
import { StatItem } from '../components/stat-item';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SummaryInput {
  attendance: { done: number; total: number };
  revenue: number;
  kpiScore: number;
  otherItems: number;
}

interface CostEstimate {
  grossSalary: number;
  totalBonus: number;
  totalPenalty: number;
  estimatedPayout: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_SUMMARY_INPUT: SummaryInput = {
  attendance: { done: 66, total: 66 },
  revenue: 4_000_000,
  kpiScore: 12,
  otherItems: 4,
};

const MOCK_COST_ESTIMATE: CostEstimate = {
  grossSalary: 1_245_800_000,
  totalBonus: 800_000,
  totalPenalty: -1_200_000,
  estimatedPayout: 1_245_800_000,
};

const COST_DOT_COLORS = {
  gross: '#000000',
  bonus: '#17C964',
  penalty: '#F31260',
  payout: '#006FEE',
} as const;

const formatVND = (amount: number): string => `${amount.toLocaleString('vi-VN')} đ`;

const formatSignedVND = (amount: number): string => `${amount > 0 ? '+' : ''} ${formatVND(amount)}`;

export const SummaryFinalize = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const [isTransferring, setIsTransferring] = useState(false);

  const handleSaveDraft = () => {};

  const handleTransfer = async () => {
    setIsTransferring(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitlePage title={t('summary-finalize.title')} />
      <div className="bg-white rounded-xl space-y-6 p-6">
        <SectionCardOtherIncome
          title={t('summary-finalize.input-summary.title', 'Tổng hợp và chốt đầu vào kỳ lương')}
        >
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatItem
              label={t('summary-finalize.input-summary.attendance', 'Chấm công')}
              value={`${MOCK_SUMMARY_INPUT.attendance.done}/${MOCK_SUMMARY_INPUT.attendance.total}`}
            />
            <StatItem
              label={t('summary-finalize.input-summary.revenue', 'Doanh số')}
              value={formatVND(MOCK_SUMMARY_INPUT.revenue)}
            />
            <StatItem
              label={t('summary-finalize.input-summary.kpi', 'Điểm KPI')}
              value={String(MOCK_SUMMARY_INPUT.kpiScore)}
            />
            <StatItem
              label={t('summary-finalize.input-summary.other', 'Khoản khác')}
              value={String(MOCK_SUMMARY_INPUT.otherItems)}
            />
          </div>
        </SectionCardOtherIncome>

        <SectionCardOtherIncome
          title={t('summary-finalize.cost-estimate.title', 'Ước tính tổng chi phí kỳ lương')}
        >
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <CostItem
              dotColor={COST_DOT_COLORS.gross}
              label={t('summary-finalize.cost-estimate.gross', 'Tổng lương Gross')}
              value={formatVND(MOCK_COST_ESTIMATE.grossSalary)}
              valueClassName="text-gray-900"
            />
            <CostItem
              dotColor={COST_DOT_COLORS.bonus}
              label={t('summary-finalize.cost-estimate.bonus', 'Tổng thưởng')}
              value={formatSignedVND(MOCK_COST_ESTIMATE.totalBonus)}
              valueClassName="text-green-600"
            />
            <CostItem
              dotColor={COST_DOT_COLORS.penalty}
              label={t('summary-finalize.cost-estimate.penalty', 'Tổng phạt')}
              value={formatVND(MOCK_COST_ESTIMATE.totalPenalty)}
              valueClassName="text-red-500"
            />
            <CostItem
              dotColor={COST_DOT_COLORS.payout}
              label={t('summary-finalize.cost-estimate.payout', 'Chi trả ước tính')}
              value={formatVND(MOCK_COST_ESTIMATE.estimatedPayout)}
              valueClassName="text-blue-600"
            />
          </div>
        </SectionCardOtherIncome>

        <ActionBanner
          t={t}
          onSaveDraft={handleSaveDraft}
          onTransfer={handleTransfer}
          isTransferring={isTransferring}
        />
      </div>
    </div>
  );
};
