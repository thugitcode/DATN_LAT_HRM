import { memo, type FC } from 'react';

import { STATUS_COLOR_MAP } from '../../constants/data';
import { AttendanceStatus, type ShiftCode } from '../../types/index.type';

interface NonPillBadgeProps {
  shift: ShiftCode;
}

export const NonPillBadge: FC<NonPillBadgeProps> = memo(({ shift }) => {
  if (shift === 'OFF') {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-dashed border-gray-200" />
    );
  }

  if (shift === AttendanceStatus.DayOff) {
    return <span className="text-gray-400 font-semibold text-sm tracking-wide select-none">N</span>;
  }

  const hexColor = STATUS_COLOR_MAP[shift] ?? '#94a3b8';
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white select-none shadow-sm transition-all duration-150 hover:scale-110 hover:shadow-md cursor-default"
      style={{ backgroundColor: hexColor }}
    >
      {shift}
    </div>
  );
});

NonPillBadge.displayName = 'NonPillBadge';
