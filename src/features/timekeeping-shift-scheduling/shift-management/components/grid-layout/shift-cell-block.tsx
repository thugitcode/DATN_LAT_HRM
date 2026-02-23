import { type FC } from 'react';

import { icons } from '@/lib/icons';

import { COL_W, ROW_H, SHIFT_COLORS } from '../../constants/constants';
import { isWeekend } from '../../helper';
import type { DayColumn, ShiftCell } from '../../types/type';

export const ShiftCellBlock: FC<{ cell: ShiftCell | null; day: DayColumn }> = ({ cell, day }) => {
  const w = COL_W - 8;
  const h = ROW_H - 8;

  if (!cell) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-[#D4D4D8]
          cursor-pointer hover:border-[#60A5FA] hover:bg-[#EFF6FF] transition-colors group
          ${isWeekend(day.dayOfWeek) ? 'bg-[#FAFAFA]' : 'bg-white'}`}
        style={{ width: w, height: h }}
      >
        {icons.plusCircle}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border text-xs font-semibold
        cursor-pointer hover:opacity-80 transition-opacity select-none ${SHIFT_COLORS[cell.type]}`}
      style={{ width: w, height: h }}
    >
      <span className="font-bold tracking-wide">{cell.name}</span>
      <span className="font-normal opacity-75 text-[11px]">{cell.time}</span>
    </div>
  );
};
