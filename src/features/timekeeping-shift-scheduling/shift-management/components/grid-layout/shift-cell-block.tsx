import { type FC } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';

import type { Shift } from '@/types';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { isWeekend } from '../../../helper';
import { COL_W, ROW_H } from '../../constants/constants';
import { SHIFT_CA_LEGEND } from '../../constants/data';
import type { DayColumn } from '../../types/type';
import { Button } from '@heroui/react';

interface ShiftCellBlockProps {
  cell: Shift | null;
  day: DayColumn;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record?: any;
  disabled?: boolean;
}

export const ShiftCellBlock: FC<ShiftCellBlockProps> = ({ cell, day, record, disabled }) => {
  const w = COL_W - 8;
  const h = ROW_H - 8;
  const { month, year } = useYearMonth();
  const color = SHIFT_CA_LEGEND.find((s) => s.status === cell?.shiftTemplateType)?.color;
  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;

  const onOpenDrawer = useDrawer((state) => state.onOpen);

  const onCreate = () => {
    onOpenDrawer(DrawerType.WORK_SHIFTS, {
      record,
      shift: cell,
      date: dateString,
      day: day.day,
      month: month + 1,
      year,
      dayOfWeek: day.dayOfWeek,
    });
  };

  const onOpenShiftDrawer = () => {
    if (!cell) return;
    onOpenDrawer(DrawerType.CHANGE_SHIFT_DIVISION, {
      record,
      shift: cell,
      date: dateString,
      day: day.day,
      month: month + 1,
      year,
      dayOfWeek: day.dayOfWeek,
    });
  };

  if (!cell) {
    return (
      <Button
        className={cn(
          `flex items-center justify-center rounded-lg border border-dashed border-[#D4D4D8]
          cursor-pointer hover:border-[#60A5FA] hover:bg-[#F0F1FF] transition-colors group`,
          isWeekend(day.dayOfWeek) ? 'bg-[#FAFAFA]' : 'bg-white',
        )}
        style={{ width: w, height: h, color }}
        onPress={onCreate}
        disabled={disabled}
      >
        {icons.plusCircle}
      </Button>
    );
  }

  return (
    <Button
      className="flex relative overflow-hidden px-2 text-sm z-10 flex-col gap-1 items-stretch justify-center rounded-lg font-semibold cursor-pointer hover:opacity-80 transition-opacity select-none"
      style={{
        width: w,
        height: h,
        color,
        backgroundColor: color + '20',
      }}
      title={cell.shiftTemplateName}
      onPress={onOpenShiftDrawer}
      disabled={disabled}
    >
      <span className="tracking-wide truncate line-clamp-1 text-center" style={{ color }}>
        {cell.shiftTemplateName}
      </span>
      <span className="font-normal opacity-75 text-black text-center">
        {cell.startTime.slice(0, 5)} - {cell.endTime.slice(0, 5)}
      </span>
      <span
        className="absolute right-0 bottom-0 border-0 w-full z-20 inline-block h-1"
        style={{ backgroundColor: color }}
      />
    </Button>
  );
};
