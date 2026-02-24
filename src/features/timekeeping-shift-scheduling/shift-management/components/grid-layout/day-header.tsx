import React, { memo, useMemo } from 'react';

import { icons } from '@/lib/icons';

import { dayNames, getDaysInMonth } from '../../../helper';
import { useYearMonth } from '../../../hooks/use-year-month';
import { COL_W, STAFF_COL_W } from '../../constants/constants';

export const DayHeader = memo(() => {
  const { month, year } = useYearMonth();

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  return (
    <div className="flex shrink-0 border-b border-[#E4E4E7] bg-[#FAFAFA] sticky top-0 z-10">
      <div className="shrink-0 border-r border-[#E4E4E7]" style={{ width: STAFF_COL_W }} />

      <div className="flex">
        {days.map((d) => (
          <div
            key={d.day}
            className={`shrink-0 flex flex-col items-center justify-end pb-2 pt-1 gap-1.5`}
            style={{ width: COL_W }}
          >
            <div className="flex items-center gap-1 text-xs text-[#71717A] font-semibold">
              {d.day} ({dayNames[d.dayOfWeek]})
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-[#71717A]">
              {icons.users}
              43
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

DayHeader.displayName = 'DayHeader';
