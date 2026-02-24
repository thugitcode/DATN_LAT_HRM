import { memo, type FC } from 'react';

import { CELL_W, PILL_INSET, STATUS_COLOR_MAP } from '../../constants/data';
import type { ShiftCode } from '../../types/index.type';

interface ShiftPillProps {
  shift: ShiftCode;
  span: number;
}

export const ShiftPill: FC<ShiftPillProps> = memo(({ shift, span }) => {
  const hexColor = STATUS_COLOR_MAP[shift] ?? '#94a3b8';
  const pillWidth = span * CELL_W - PILL_INSET * 2;

  return (
    <div
      className="flex items-center justify-around rounded-full text-white font-bold text-xs select-none cursor-default transition-all duration-150 hover:brightness-110 hover:shadow-lg"
      style={{
        width: pillWidth,
        height: 36,
        backgroundColor: hexColor,
        flexShrink: 0,
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      {Array.from({ length: span }, (_, i) => (
        <span key={i}>{shift}</span>
      ))}
    </div>
  );
});

ShiftPill.displayName = 'ShiftPill';
