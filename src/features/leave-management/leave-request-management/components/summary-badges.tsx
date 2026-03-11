import type { FC } from 'react';

import { StatusSummaryItem } from '@/components/status-summary-tabs/status-summary-item';
import { StatusSummaryTabs } from '@/components/status-summary-tabs/status-summary-tabs';

import { SUMMARY_BADGES } from '../../constants/constants';
import type { MetadataLeaveRequest } from '../type';

interface SummaryBadgesProps {
  summary?: MetadataLeaveRequest | null;
}

const VerticalDivider = () => <div className="w-px h-10 bg-[#E4E4E7] shrink-0" aria-hidden />;

export const SummaryBadges: FC<Readonly<SummaryBadgesProps>> = ({ summary }) => {
  return (
    <StatusSummaryTabs className="flex flex-wrap items-center gap-4">
      {SUMMARY_BADGES.map(({ key, icon, label, color, bgColor }, index) => (
        <div key={key} className="flex items-center gap-4">
          {index !== 0 && <VerticalDivider />}
          <StatusSummaryItem
            icon={icon}
            label={label}
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
