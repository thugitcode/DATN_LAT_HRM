import type { FC } from 'react';

export const ExplanationTypeRow: FC<
  Readonly<{ label: string; count: number; maxCount: number }>
> = ({ label, count, maxCount }) => {
  const percentage = maxCount > 0 ? Math.min((count / maxCount) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-2 min-w-0 w-full">
      <span className="text-sm text-[#11181C] truncate flex-1 min-w-0" title={label}>
        {label}
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
