import { type FC } from 'react';

import type { KpiRatingEnum } from '../types/kpi.type';

interface KpiScoreProps {
  score?: number;
  max?: number;
  rating?: KpiRatingEnum;
}

export const KpiScore: FC<Readonly<KpiScoreProps>> = ({ score = 0, max = 100 }) => {
  const percentage = Math.min((score / max) * 100, 100);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-3 w-22.5 bg-gray-100 rounded-full overflow-hidden ">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-700 min-w-7 text-right">{score}</span>
    </div>
  );
};
