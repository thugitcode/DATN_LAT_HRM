import { icons } from '@/lib/icons';

import type { MetadataRecruitmentRequest } from '../recruitment-request-list/types/type';

type SummaryKey = keyof MetadataRecruitmentRequest;

export const SUMMARY_BADGE_KEYS = [
  {
    key: 'totalAll' satisfies SummaryKey,
    icon: icons.questionCircle,
    color: '#000000',
    bgColor: '#F2EAFA',
  },
  {
    key: 'totalRecruiting' satisfies SummaryKey,
    icon: icons.questionCircle,
    color: '#6576FF',
    bgColor: '#E6F1FE',
  },
  {
    key: 'totalPending' satisfies SummaryKey,
    icon: <icons.refreshCircle />,
    color: '#F5A524',
    bgColor: '#FEFCE8',
  },
  {
    key: 'totalRejected' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    color: '#F31260',
    bgColor: '#FEE7EF',
  },
  {
    key: 'totalApproved' satisfies SummaryKey,
    icon: <icons.tickCircle />,
    color: '#17C964',
    bgColor: '#E8FAF0',
  },
  {
    key: 'totalCancelled' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    color: '#F31260',
    bgColor: '#FEFCE8',
  },
  {
    key: 'totalPaused' satisfies SummaryKey,
    icon: <icons.refreshCircle />,
    color: '#F5A524',
    bgColor: '#F2EAFA',
  },
  {
    key: 'totalClosed' satisfies SummaryKey,
    icon: <icons.closeSquare />,
    color: '#000000',
    bgColor: '#F4F4F5',
  },
] as const;
