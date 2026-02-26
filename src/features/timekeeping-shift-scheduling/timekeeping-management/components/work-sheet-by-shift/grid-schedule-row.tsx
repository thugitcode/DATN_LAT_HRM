import { Fragment, type FC } from 'react';

import { cn } from '@/lib/utils';

import { PILL_INSET, PILL_SHIFTS } from '../../constants/data';
import { type DayCell, type ShiftRun } from '../../types/index.type';
import { NonPillBadge } from './non-pill-badge';
import { ShiftPill } from './shift-pill';

interface GridScheduleRowProps {
  schedule: DayCell[];
  runs: ShiftRun[];
  isHovered: boolean;
  hoveredDay: number | null;
  onDayEnter: (di: number) => void;
  onDayLeave: () => void;
}

export const GridScheduleRow: FC<GridScheduleRowProps> = ({
  hoveredDay,
  isHovered,
  runs,
  schedule,
  onDayEnter,
  onDayLeave,
}) => {
  return (
    <Fragment>
      {runs.map((run) => {
        const isPill = PILL_SHIFTS.has(run.shift);
        const di = run.startIndex;
        const isCN = schedule?.[di]?.weekday === 'CN';
        const isColHovered = hoveredDay !== null && hoveredDay >= di && hoveredDay < di + run.span;

        return (
          <td
            key={di}
            colSpan={run.span}
            onMouseEnter={() => onDayEnter(di)}
            onMouseLeave={onDayLeave}
            className={cn(
              'border-b border-gray-50 p-0 transition-colors duration-100',
              isHovered && isColHovered && 'bg-blue-100/60',
              !isHovered && isColHovered && 'bg-blue-50/60',
              !isColHovered && isCN && !isPill && 'bg-red-50/30',
            )}
          >
            {isPill ? (
              <div
                className="flex items-center h-full"
                style={{ paddingLeft: PILL_INSET, paddingRight: PILL_INSET }}
              >
                <ShiftPill shift={run.shift} span={run.span} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <NonPillBadge shift={run.shift} />
              </div>
            )}
          </td>
        );
      })}
    </Fragment>
  );
};
