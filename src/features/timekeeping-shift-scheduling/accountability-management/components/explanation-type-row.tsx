import type { FC } from 'react';
import type { AttendanceExplanationType } from '@/types/attendance-explanation.type';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

export const ExplanationTypeRow: FC<
  Readonly<{ count: number; maxCount: number, explanationType: AttendanceExplanationType }>
> = ({ count, maxCount, explanationType }) => {
  const percentage = maxCount > 0 ? Math.min((count / maxCount) * 100, 100) : 0;
  const { t } = useTranslation(NAMESPACES.COMMON)
  return (
    <div className="flex items-center gap-2 min-w-0 w-full">
      <span className="text-sm text-[#11181C] truncate flex-1 min-w-0" title={t(`explanation_types.${explanationType}`)}>
        {t(`explanation_types.${explanationType}`)}
      </span>
      <div className="relative h-2 w-16 rounded-full bg-[#E4E4E7] shrink-0">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#006FEE] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-[#11181C] shrink-0 tabular-nums">
        {count}
      </span>
    </div>
  );
};
