import { icons } from '@/lib/icons';

import type { MetadataLeaveRequest } from '../leave-request-management/type';

type SummaryKey = keyof MetadataLeaveRequest;

interface SummaryBadgeConfig {
  key: SummaryKey;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

export const SUMMARY_BADGE_KEYS = [
  {
    key: 'totalAll' satisfies SummaryKey,
    icon: icons.questionCircle,
    color: '#006FEE',
    bgColor: '#E6F1FE',
  },
  {
    key: 'totalApproved' satisfies SummaryKey,
    icon: <icons.tickCircle />,
    color: '#17C964',
    bgColor: '#E8FAF0',
  },
  {
    key: 'totalRejected' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    color: '#F31260',
    bgColor: '#FEE7EF',
  },
  {
    key: 'totalPending' satisfies SummaryKey,
    icon: <icons.refreshCircle />,
    color: '#F5A524',
    bgColor: '#FEF4E6',
  },
] as const;

export const SUMMARY_BADGES = [
  {
    key: 'totalAll' satisfies SummaryKey,
    icon: icons.questionCircle,
    label: 'Tổng yêu cầu',
    color: '#006FEE',
    bgColor: '#E6F1FE',
  },
  {
    key: 'totalApproved' satisfies SummaryKey,
    icon: <icons.tickCircle />,
    label: 'Đã duyệt',
    color: '#17C964',
    bgColor: '#E8FAF0',
  },
  {
    key: 'totalRejected' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    label: 'Từ chối',
    color: '#F31260',
    bgColor: '#FEE7EF',
  },
  {
    key: 'totalPending' satisfies SummaryKey,
    icon: <icons.refreshCircle />,
    label: 'Chờ duyệt',
    color: '#F5A524',
    bgColor: '#FEF4E6',
  },
] as const satisfies SummaryBadgeConfig[];
