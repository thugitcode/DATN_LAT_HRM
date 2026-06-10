import { type FC, type ReactNode } from 'react';

import { icons } from '@/lib/icons';

import { getRatingLabel } from '../constants/kpi';
import { KpiRatingEnum } from '../types/kpi.type';

interface KpiRatingProps {
  rating?: KpiRatingEnum;
}

type RatingConfig = {
  icon: ReactNode;
  colorClass: string;
};

const RATING_CONFIG: Record<KpiRatingEnum, RatingConfig> = {
  [KpiRatingEnum.EXCELLENT]: {
    icon: icons.excellent,
    colorClass: 'text-[#17C964]',
  },
  [KpiRatingEnum.GOOD]: {
    icon: icons.good,
    colorClass: 'text-[#F5A524]',
  },
  [KpiRatingEnum.NOT_MET]: {
    icon: icons.notMet,
    colorClass: 'text-[#F31260]',
  },
};

export const KpiRating: FC<KpiRatingProps> = ({ rating }) => {
  if (!rating) return null;

  const config = RATING_CONFIG[rating];
  if (!config) return null;

  return (
    <div className="flex flex-nowrap items-center gap-2.5">
      <span>{config.icon}</span>
      <span className={`text-nowrap ${config.colorClass}`}>{getRatingLabel(rating)}</span>
    </div>
  );
};
