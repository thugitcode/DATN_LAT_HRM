import { memo, type FC } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';

import { STATUS_COLOR_MAP, WORK_SHEET_LEGEND_ITEMS } from '../../constants/data';
import { AttendanceStatus, type ShiftCode } from '../../types/index.type';

const HATCH_PATTERN_ID = 'non-pill-hatch';

const BASE_CLASS =
  'size-9 rounded-full select-none cursor-default transition-all duration-150 hover:scale-110 hover:shadow-md';

const getLabel = (shift: ShiftCode): string => {
  return WORK_SHEET_LEGEND_ITEMS.find((item) => item.status === shift)?.label ?? shift;
};

interface NonPillBadgeProps {
  shift: ShiftCode;
  workScheduleDetailId?: string;
}

export const NonPillBadge: FC<NonPillBadgeProps> = memo(({ shift, workScheduleDetailId }) => {
  const label = getLabel(shift);

  const open = useDrawer((state) => state.onOpen);

  const onClick = () => {
    open(
      DrawerType.TIME_SHEET_DETAIL,

      workScheduleDetailId,
    );
  };

  if (shift === AttendanceStatus.DayOff) {
    return (
      <div title={label} className={`${BASE_CLASS} relative overflow-hidden bg-gray-100`}>
        <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={HATCH_PATTERN_ID}
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#d1d5db" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${HATCH_PATTERN_ID})`} />
        </svg>
        <span className="absolute inset-0 z-10 flex items-center justify-center text-xs font-semibold text-gray-600">
          N
        </span>
      </div>
    );
  }

  return (
    <div
      title={label}
      className={`${BASE_CLASS} flex items-center justify-center text-xs font-bold text-white`}
      style={{ backgroundColor: STATUS_COLOR_MAP[shift] ?? '#94a3b8' }}
      onClick={onClick}
    >
      {shift}
    </div>
  );
});

NonPillBadge.displayName = 'NonPillBadge';
