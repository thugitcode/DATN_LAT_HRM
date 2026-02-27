import { memo, type FC } from 'react';

import {
  CELL_W,
  PILL_INSET,
  STATUS_COLOR_MAP,
  WORK_SHEET_LEGEND_ITEMS,
} from '../../constants/data';
import type { ShiftCode } from '../../types/index.type';

interface ShiftPillProps {
  shift: ShiftCode;
  span: number;
  hoveredOffset: number | null;
}

const getLabel = (shift: ShiftCode): string => {
  return WORK_SHEET_LEGEND_ITEMS.find((i) => i.status === shift)?.label ?? shift;
};

const getCells = (span: number): number[] => {
  return Array.from({ length: span }, (_, i) => i);
};

export const ShiftPill: FC<ShiftPillProps> = memo(({ shift, span, hoveredOffset }) => {
  return (
    <div
      title={getLabel(shift)}
      className="relative flex items-center rounded-4xl text-white font-bold text-xs select-none cursor-default transition-all duration-150 hover:brightness-110 hover:shadow-lg overflow-hidden"
      style={{
        width: span * CELL_W - PILL_INSET * 2,
        height: 36,
        backgroundColor: STATUS_COLOR_MAP[shift] ?? '#94a3b8',
        flexShrink: 0,
      }}
    >
      {hoveredOffset !== null && (
        <div
          className="absolute inset-y-0 bg-white/20 pointer-events-none"
          style={{
            left: hoveredOffset * CELL_W - PILL_INSET,
            width: CELL_W,
          }}
        />
      )}

      {getCells(span).map((i) => (
        <span
          key={i}
          className="flex items-center justify-center shrink-0"
          style={{ width: CELL_W }}
        >
          {shift}
        </span>
      ))}
    </div>
  );
});

ShiftPill.displayName = 'ShiftPill';
