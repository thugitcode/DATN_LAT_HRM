import { type FC } from 'react';

import { cn } from '@/lib/utils';
import { dayNames, isWeekend } from '@/features/timekeeping-shift-scheduling/helper';
import type { DayColumn } from '@/features/timekeeping-shift-scheduling/shift-management/types/type';

interface GridStickyHeaderRowProps {
  hoveredDay: number | null;
  setHoveredDay: (d: number | null) => void | null;
  days: DayColumn[];
}

export const GridStickyHeaderRow: FC<Readonly<GridStickyHeaderRowProps>> = ({
  hoveredDay,
  setHoveredDay,
  days,
}) => {
  return (
    <thead className="sticky top-0 z-20 ">
      <tr>
        <th className="sticky left-0 z-30 w-52 h-17.5 bg-[#F4F4F5] border-0 p-0" />

        {days.map((day, di) => {
          const isCN = isWeekend(day.dayOfWeek);
          return (
            <th
              key={di}
              onMouseEnter={() => setHoveredDay(di)}
              onMouseLeave={() => setHoveredDay(null)}
              className={cn(
                'h-17.5 text-xs font-semibold border-0 p-0',
                'transition-colors duration-100 cursor-default',
                'first-of-type:rounded-tl-xl last-of-type:rounded-tr-xl',
                hoveredDay === di ? 'bg-blue-50' : 'bg-white',
                isCN && 'bg-red-50/60',
              )}
            >
              <div className="flex flex-col gap-3 items-center justify-center h-full ">
                <span
                  className={cn('uppercase tracking-wide', isCN ? 'text-red-400' : 'text-gray-400')}
                >
                  {dayNames[day.dayOfWeek]}
                </span>
                <span className={cn(isCN ? 'text-red-500' : 'text-gray-700')}>{day.day}</span>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
