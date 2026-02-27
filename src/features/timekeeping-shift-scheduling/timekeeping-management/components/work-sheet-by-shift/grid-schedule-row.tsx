import { Fragment, useCallback, type FC } from 'react';

import { cn } from '@/lib/utils';

import { CELL_W, PILL_INSET, PILL_SHIFTS } from '../../constants/data';
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
  const handlePillMouseMove = useCallback(
    (e: React.MouseEvent<HTMLTableCellElement>, run: ShiftRun) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const offset = Math.min(Math.floor((e.clientX - rect.left) / CELL_W), run.span - 1);
      onDayEnter(run.startIndex + offset);
    },
    [onDayEnter],
  );

  return (
    <Fragment>
      {runs.map((run) => {
        const isPill = PILL_SHIFTS.has(run.shift);
        const { startIndex: di, span, shift } = run;
        const isCN = schedule[di]?.day === 0;
        const isColHovered = hoveredDay !== null && hoveredDay >= di && hoveredDay < di + span;
        const hoveredOffset = isColHovered && hoveredDay !== null ? hoveredDay - di : null;

        return (
          <td
            key={di}
            colSpan={span}
            onMouseMove={isPill ? (e) => handlePillMouseMove(e, run) : undefined}
            onMouseEnter={!isPill ? () => onDayEnter(di) : undefined}
            onMouseLeave={onDayLeave}
            className={cn(
              'border-b border-gray-50 p-0 transition-colors duration-100',
              !isPill && isColHovered && (isHovered ? 'bg-blue-100/60' : 'bg-blue-50/60'),
              !isPill && !isColHovered && isCN && 'bg-red-50/30',
            )}
          >
            {isPill ? (
              <div className="flex items-center h-full px-1.5">
                <ShiftPill shift={shift} span={span} hoveredOffset={hoveredOffset} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <NonPillBadge shift={shift} />
              </div>
            )}
          </td>
        );
      })}
    </Fragment>
  );
};
