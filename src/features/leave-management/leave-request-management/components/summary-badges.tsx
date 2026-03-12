import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { StatusSummaryItem } from '@/components/status-summary-tabs/status-summary-item';
import { StatusSummaryTabs } from '@/components/status-summary-tabs/status-summary-tabs';

import { SUMMARY_BADGE_KEYS, SUMMARY_BADGES } from '../../constants/constants';
import type { MetadataLeaveRequest } from '../type';

interface SummaryBadgesProps {
  summary?: MetadataLeaveRequest | null;
}

const VerticalDivider = () => <div className="w-px h-10 bg-[#E4E4E7] shrink-0" aria-hidden />;

export const SummaryBadges: FC<Readonly<SummaryBadgesProps>> = ({ summary }) => {
  const { t } = useTranslation(NAMESPACES.LEAVE_MANAGEMENT);

  const labelMap: Record<string, string> = {
    totalAll: t('leave_request.summary.total'),
    totalApproved: t('leave_request.summary.approved'),
    totalRejected: t('leave_request.summary.rejected'),
    totalPending: t('leave_request.summary.pending'),
  };

  return (
    <StatusSummaryTabs className="flex flex-wrap items-center gap-4">
      {SUMMARY_BADGE_KEYS.map(({ key, icon, color, bgColor }, index) => (
        <div key={key} className="flex items-center gap-4">
          {index !== 0 && <VerticalDivider />}
          <StatusSummaryItem
            icon={icon}
            label={labelMap[key] as string}
            count={summary?.[key]}
            color={color}
            bgColor={bgColor}
            className="flex-row items-center! gap-2"
          />
        </div>
      ))}
    </StatusSummaryTabs>
  );
};
