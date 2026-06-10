import { DrawerType, useDrawer } from '@/store/useDrawer';
import { memo, useRef, type FC } from 'react';

import { getLabelShift } from '@/features/timekeeping-shift-scheduling/helper';

import {
  CELL_W,
  PILL_INSET,
  STATUS_COLOR_MAP
} from '../../constants/data';
import type { ShiftCode } from '../../types/index.type';

interface ShiftPillProps {
  shift: ShiftCode;
  span: number;
  hoveredOffset: number | null;
  workScheduleDetailId?: string[] | string;
}

export const ShiftPill: FC<ShiftPillProps> = memo(
  ({ shift, span, hoveredOffset, workScheduleDetailId }) => {
    const pillRef = useRef<HTMLDivElement>(null);
    const open = useDrawer((state) => state.onOpen);

    const onClick = (index: number) => {
      const id = Array.isArray(workScheduleDetailId)
        ? workScheduleDetailId[index]
        : workScheduleDetailId;

      open(
        DrawerType.TIME_SHEET_DETAIL,

        id,
      );
    };

    // useEffect(() => {
    //   if (pillRef.current)
    //     const td = pillRef.current.closest('td');
    //     console.log({
    //       pillWidth: pillRef.current.getBoundingClientRect().width,
    //       tdWidth: td?.getBoundingClientRect().width,
    //       expectedTdWidth: span * CELL_W,
    //       CELL_W,
    //       PILL_INSET,
    //       span,
    //     });
    //   }
    // }, [span]);

    return (
      <div className="w-full" style={{ paddingLeft: PILL_INSET, paddingRight: PILL_INSET }}>
        <div
          ref={pillRef}
          title={getLabelShift(shift)}
          className="relative flex items-center rounded-4xl text-white font-bold text-xs select-none cursor-default transition-all duration-150 hover:brightness-110 hover:shadow-lg overflow-hidden"
          style={{
            height: 36,
            backgroundColor: STATUS_COLOR_MAP[shift] ?? '#94a3b8',
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

          <div className="flex" style={{ marginLeft: -PILL_INSET, marginRight: -PILL_INSET }}>
            {Array.from({ length: span }, (_, i) => (
              <span
                key={i}
                className="flex items-center justify-center shrink-0"
                style={{ width: CELL_W, height: 36 }}
                onClick={() => onClick(i)}
              >
                {shift}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

ShiftPill.displayName = 'ShiftPill';
