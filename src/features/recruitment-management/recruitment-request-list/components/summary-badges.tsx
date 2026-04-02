import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { StatusSummaryItem } from '@/components/status-summary-tabs/status-summary-item';
import { StatusSummaryTabs } from '@/components/status-summary-tabs/status-summary-tabs';

import { SUMMARY_BADGE_KEYS } from '../../constants/constants';
import type { MetadataRecruitmentRequest } from '../type';

interface SummaryBadgesProps {
  summary?: MetadataRecruitmentRequest | null;
}

export const SummaryBadges: FC<Readonly<SummaryBadgesProps>> = ({ summary }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const labelMap: Record<string, string> = {
    totalAll: t('recruitment_request.summary.total'),
    totalRecruiting: t('recruitment_request.summary.recruiting'),
    totalPending: t('recruitment_request.summary.pending'),
    totalRejected: t('recruitment_request.summary.rejected'),
    totalApproved: t('recruitment_request.summary.approved'),
    totalCancelled: t('recruitment_request.summary.cancelled'),
    totalPaused: t('recruitment_request.summary.paused'),
    totalClosed: t('recruitment_request.summary.closed'),
  };

  return (
    <StatusSummaryTabs className="flex flex-wrap items-center gap-3">
      {SUMMARY_BADGE_KEYS.map(({ key, icon, color, bgColor }) => (
        <StatusSummaryItem
          key={key}
          icon={icon}
          label={labelMap[key] ?? key}
          count={summary?.[key]}
          color={color}
          bgColor={bgColor}
        />
      ))}
    </StatusSummaryTabs>
  );
};
