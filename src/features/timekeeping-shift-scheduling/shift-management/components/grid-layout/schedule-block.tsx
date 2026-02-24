import { type FC } from 'react';

import { isWeekend } from '../../../helper';
import { COL_W, ROW_GAP, ROW_H, ROW_PY } from '../../constants/constants';
import type { DayColumn, StaffRow } from '../../types/type';
import { ShiftCellBlock } from './shift-cell-block';

const calcBlockHeight = (rowCount: number) => {
  return ROW_PY * 2 + rowCount * ROW_H + Math.max(0, rowCount - 1) * ROW_GAP;
};

export const ScheduleBlock: FC<{
  staff: StaffRow;
  days: DayColumn[];
  expanded: boolean;
}> = ({ staff, days, expanded }) => {
  const visibleRows = expanded ? staff.scheduleRows : staff.scheduleRows.slice(0, 1);
  console.log('staff______', staff);
  return (
    <div
      className="flex flex-col border-b border-[#F4F4F5] transition-[height] duration-300 overflow-hidden"
      style={{
        height: calcBlockHeight(visibleRows.length),
        paddingTop: ROW_PY,
        paddingBottom: ROW_PY,
        gap: ROW_GAP,
      }}
    >
      {visibleRows.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1 px-1">
          {days.map((d, dIdx) => (
            <div
              key={dIdx}
              className={`shrink-0 flex items-center justify-center
                ${isWeekend(d.dayOfWeek) ? 'bg-[#FFFBEB]/40 rounded' : ''}`}
              style={{ width: COL_W }}
            >
              <ShiftCellBlock cell={row[dIdx] ?? null} day={d} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
