import React, { memo, useMemo, type FC } from 'react';

import type { StaffSchedule } from '@/types';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { dayNames, getDaysInMonth } from '../../../helper';
import { useYearMonth } from '../../../hooks/use-year-month';
import { COL_W, STAFF_COL_W } from '../../constants/constants';

interface DayHeaderProps {
  data?: StaffSchedule[];
}

export const DayHeader: FC<DayHeaderProps> = memo(({ data }) => {
  const { month, year } = useYearMonth();

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const staffCountByDate = useMemo(() => {
    if (!data) return {};

    const map: Record<string, number> = {};

    for (const staff of data) {
      for (const day of staff.schedules) {
        if (!day.shifts?.length) continue;

        const key = day.date.slice(0, 10);
        map[key] = (map[key] ?? 0) + 1;
      }
    }

    return map;
  }, [data]);

  return (
    <div className="flex shrink-0 sticky top-0 z-30">
      <div className="shrink-0 bg-[#F4F4F5]" style={{ width: STAFF_COL_W }} />

      <div className="flex ">
        {days.map((d, di) => (
          <div
            key={d.day}
            className={cn(
              'shrink-0 flex flex-col items-center justify-end pb-2 pt-1 gap-1.5 bg-white',
              di === 0 && 'rounded-tl-xl',
              di === days.length - 1 && 'rounded-tr-xl',
            )}
            style={{ width: COL_W }}
          >
            <div className="flex items-center gap-1 text-xs text-[#71717A] font-semibold">
              {d.day} ({dayNames[d.dayOfWeek]})
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-[#71717A]">
              {icons.users}
              {/* {staffCountByDate[d.date] || 0} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

DayHeader.displayName = 'DayHeader';
