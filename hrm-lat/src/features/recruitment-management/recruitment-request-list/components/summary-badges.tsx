import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { StatusSummaryItem } from '@/components/status-summary-tabs/status-summary-item';
import { StatusSummaryTabs } from '@/components/status-summary-tabs/status-summary-tabs';

import { SUMMARY_BADGE_KEYS } from '../../constants/candidate.constants';
import type { MetadataRecruitmentRequest } from '../types/type';

interface SummaryBadgesProps {
  summary?: MetadataRecruitmentRequest | null;
}

export const SummaryBadges: FC<Readonly<SummaryBadgesProps>> = ({ summary }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const labelMap: Record<string, string> = {
    total: t('recruitment_request.summary.total'),
    RECRUITING: t('recruitment_request.summary.recruiting'),
    PENDING: t('recruitment_request.summary.pending'),
    REJECTED: t('recruitment_request.summary.rejected'),
    APPROVED: t('recruitment_request.summary.approved'),
    CANCELLED: t('recruitment_request.summary.cancelled'),
    PAUSED: t('recruitment_request.summary.paused'),
    CLOSED: t('recruitment_request.summary.closed'),
  };

  return (
    <StatusSummaryTabs className="flex items-center gap-3">
      {SUMMARY_BADGE_KEYS.map(({ key, icon, color, bgColor }) => (
        <StatusSummaryItem
          key={key}
          icon={null}
          label={labelMap[key] ?? key}
          count={summary?.[key]}
          color={color}
          bgColor={"#F4F4F5"}
          className="flex-1"
        />
      ))}
    </StatusSummaryTabs>
  );
};
