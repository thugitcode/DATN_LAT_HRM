import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';
import { buildHourlySlots, mergeConsecutiveSlots, parseMins } from '../helpers';
import type { TimelineSegment } from '../../types/types';
import { EMPTY_COLOR, EMPTY_TYPE } from '../contants/data';

interface ShiftTimelineProps {
  timeline: TimelineSegment[];
}

// Parse "HH:mm:ss", "HH:mm", "HH:mm AM/PM" → minutes since midnight


export function ShiftTimeline({ timeline }: ShiftTimelineProps) {
  const { t } = useTranslation(NAMESPACES.COMMON);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6 text-gray-400 text-sm">--</div>
    );
  }

  const startHour = Math.min(
    ...timeline.map(s => {
      const m = parseMins(s.startTime);
      return m !== null ? Math.floor(m / 60) : 23;
    })
  );
  const endHour = 23;
  const totalHours = endHour - startHour + 1;

  const hourlySlots = buildHourlySlots(timeline, startHour, endHour);
  const mergedSlots = mergeConsecutiveSlots(hourlySlots);
  const FULL_SPAN = 17

  const hasOneBlock = mergedSlots.length === 2 && mergedSlots.findIndex((s) => s.type === 'OTHER') !== -1

  return (
    <div className="overflow-x-auto h-full px-2">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${totalHours}, minmax(28px, 1fr))`,
          gridTemplateRows: '12px 28px',
          minWidth: `${totalHours * 28}px`,
        }}
      >
        {/* Row 1: hour labels — one per merged block (at its start column) */}
        {!hasOneBlock && mergedSlots.map((slot, i) => {
          const colStart = slot.hourStart - startHour + 1;
          const isLast = i === mergedSlots.length - 1;

          return (
            <div
              key={`label-${i}`}
              className="flex items-end pb-0.5"
              style={{ gridColumn: `${colStart} / span ${slot.span}`, gridRow: 1 }}
            >
              <span className="text-[10px] text-gray-400 leading-none">
                {slot.labelStart}
              </span>
              {isLast && slot.span >= 2 && (
                <span className="text-[10px] text-gray-400 leading-none ml-auto">
                  {slot.labelEnd}
                </span>
              )}
            </div>
          );
        })}

        {/* Row 2: merged colored blocks with type label inside */}
        {mergedSlots.map((slot, i) => {
          const colStart = slot.hourStart - startHour + 1;
          const isEmpty = slot.type === EMPTY_TYPE && slot.color === EMPTY_COLOR;
          return (
            <div
              key={`block-${i}`}
              title={isEmpty ? undefined : t(`options.timeline.${slot.type}` as any)}
              className="flex items-center justify-center rounded-lg transition-all hover:brightness-110 cursor-pointer overflow-hidden"
              style={{
                gridColumn: `${colStart} / span ${hasOneBlock ? FULL_SPAN : slot.span}`,
                gridRow: 2,
                background: slot.color,
                color: slot.type === 'BREAK' ? '#52525B' : 'white',
                marginLeft: '1px',
                marginRight: '1px',
                zIndex: slot.type === 'OTHER' ? 0 : 1
              }}
            >
              {!isEmpty && (
                <span className="text-[11px] font-medium truncate px-1 text-center w-full">
                  {t(`options.timeline.${slot.type}` as any)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
