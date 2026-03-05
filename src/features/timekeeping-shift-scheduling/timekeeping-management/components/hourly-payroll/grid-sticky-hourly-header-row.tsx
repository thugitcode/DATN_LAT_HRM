import { type FC } from 'react';

import { cn } from '@/lib/utils';
import { dayNames, isWeekend } from '@/features/timekeeping-shift-scheduling/helper';
import type { DayColumn } from '@/features/timekeeping-shift-scheduling/shift-management/types/type';

import { CELL_W, STICKY_COL_W, SUMMARY_COL_W } from '../../constants/data';
import { TOTAL_HOUR_COLUMNS } from '../../hooks/use-columns-hourly-payroll';
import { SUMMARY_COLUMNS } from '../../hooks/use-work-sheet-columns';

interface GridStickyHeaderRowProps {
  hoveredDay: number | null;
  setHoveredDay: (d: number | null) => void | null;
  hoveredSummaryCol: string | null;
  setHoveredSummaryCol: (key: string | null) => void;
  days: DayColumn[];
}

export const GridStickyHourlyHeaderRow: FC<Readonly<GridStickyHeaderRowProps>> = ({
  hoveredDay,
  setHoveredDay,
  hoveredSummaryCol,
  setHoveredSummaryCol,
  days,
}) => {
  return (
    <thead className="sticky top-0 z-30">
      <tr>
        <th
          className="sticky left-0 z-40 bg-[#F4F4F5] border-0 p-0"
          style={{ width: STICKY_COL_W, minWidth: STICKY_COL_W }}
        />

        {days.map((day, di) => {
          const isCN = isWeekend(day.dayOfWeek);
          const isHovered = hoveredDay === di;

          return (
            <th
              key={di}
              onMouseEnter={() => setHoveredDay(di)}
              onMouseLeave={() => setHoveredDay(null)}
              className={cn(
                'h-17.5 text-xs font-semibold border-0 p-0',
                'transition-colors duration-100 cursor-default',
                di === 0 && 'rounded-tl-[14px]',
              )}
              style={{
                width: CELL_W,
                minWidth: CELL_W,
                backgroundColor: isHovered ? '#EFF6FF' : isCN ? '#FEF2F2' : '#ffffff',
              }}
            >
              <div className="flex flex-col gap-3 items-center justify-center h-full">
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

        {TOTAL_HOUR_COLUMNS.map((col, ci) => (
          <th
            key={col.key}
            onMouseEnter={() => setHoveredSummaryCol(col.key)}
            onMouseLeave={() => setHoveredSummaryCol(null)}
            className={cn(
              'h-17.5 text-[11px] font-semibold border-0 p-0 cursor-default bg-white',
              'text-center align-middle text-gray-500 transition-colors duration-100',
              ci === 0 && 'border-l border-gray-200',
              ci === SUMMARY_COLUMNS.length - 1 && 'rounded-tr-[14px]',
            )}
            style={{
              width: SUMMARY_COL_W,
              minWidth: SUMMARY_COL_W,
              backgroundColor: hoveredSummaryCol === col.key ? '#EFF6FF' : '#FFFFFF',
            }}
          >
            <div className="flex items-center justify-center h-full px-1">
              <span className="uppercase tracking-wide leading-tight text-center">{col.title}</span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
