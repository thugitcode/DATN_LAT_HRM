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
    <thead className="sticky top-0 z-30">
      <tr>
        <th
          className="sticky left-0 z-40 bg-[#F4F4F5] shrink-0"
          style={{ width: STAFF_COL_W, minWidth: STAFF_COL_W }}
        />

        {days.map((d, di) => (
          <th
            key={d.day}
            className={cn(
              'bg-white pb-2 pt-1 font-normal',
              di === 0 && 'rounded-tl-[14px]',
              di === days.length - 1 && 'rounded-tr-[14px]',
            )}
            style={{ width: COL_W, minWidth: COL_W }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-[#71717A] font-semibold">
                {d.day} ({dayNames[d.dayOfWeek]})
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-[#71717A]">
                {icons.users}
                {staffCountByDate[d.date] || 0}
              </span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
});

DayHeader.displayName = 'DayHeader';
