import type { FC } from 'react';

import { StatusSummaryItem } from '@/components/status-summary-tabs/status-summary-item';
import { StatusSummaryTabs } from '@/components/status-summary-tabs/status-summary-tabs';

import { SUMMARY_BADGE_KEYS } from '../../constants/constants';
import type { MetadataRecruitmentRequest } from '../type';

interface SummaryBadgesProps {
  summary?: MetadataRecruitmentRequest | null;
}

const LABEL_MAP: Record<string, string> = {
  totalAll: 'Tổng yêu cầu',
  totalRecruiting: 'Đang tuyển',
  totalPending: 'Chờ duyệt',
  totalClosed: 'Đã đóng',
};

export const SummaryBadges: FC<Readonly<SummaryBadgesProps>> = ({ summary }) => {
  return (
    <StatusSummaryTabs className="flex flex-wrap items-center gap-3">
      {SUMMARY_BADGE_KEYS.map(({ key, icon, color, bgColor }) => (
        <StatusSummaryItem
          key={key}
          icon={icon}
          label={LABEL_MAP[key] ?? key}
          count={summary?.[key]}
          color={color}
          bgColor={bgColor}
        />
      ))}
    </StatusSummaryTabs>
  );
};
