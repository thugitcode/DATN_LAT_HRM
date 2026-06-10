import { memo, useMemo, type FC } from 'react';

import { cn } from '@/lib/utils';

import { KpiRatingEnum } from '../types/kpi.type';

// ─── Constants ────────────────────────────────────────────────────────────────

const RATING_CONFIG = {
  [KpiRatingEnum.EXCELLENT]: {
    barClass: 'bg-[#17C964]',
    label: 'Excellent',
  },
  [KpiRatingEnum.GOOD]: {
    barClass: 'bg-[#F5A524]',
    label: 'Good',
  },
  [KpiRatingEnum.NOT_MET]: {
    barClass: 'bg-[#F31260]',
    label: 'Bad',
  },
} as const satisfies Record<KpiRatingEnum, { barClass: string; label: string }>;

const DEFAULT_RATING_CONFIG = RATING_CONFIG[KpiRatingEnum.NOT_MET];

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiScoreProps {
  score?: number;
  max?: number;
  rating?: KpiRatingEnum;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const KpiScore: FC<Readonly<KpiScoreProps>> = memo(
  ({ score = 0, max = 100, rating, className }) => {
    const percentage = useMemo(
      () => (max > 0 ? Math.min((score / max) * 100, 100) : 0),
      [score, max],
    );

    const { barClass, label } = rating
      ? (RATING_CONFIG[rating] ?? DEFAULT_RATING_CONFIG)
      : DEFAULT_RATING_CONFIG;

    return (
      <div
        className={cn('flex items-center gap-2 w-full', className)}
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`KPI score: ${score}/${max} — ${label}`}
      >
        <div className="flex-1 h-2 w-22.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', barClass)}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span className="text-sm text-gray-700 min-w-7 text-right" aria-hidden="true">
          {score}
        </span>
      </div>
    );
  },
);

KpiScore.displayName = 'KpiScore';
