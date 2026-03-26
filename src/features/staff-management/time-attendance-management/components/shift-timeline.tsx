import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';
import { TIMELINE_COLOR_MAP } from '../helpers';
import type { TimelineSegment, TimelineType } from '../types';

interface ShiftTimelineProps {
  timeline: TimelineSegment[];
}

// Parse "HH:mm:ss", "HH:mm", "HH:mm AM/PM" → minutes since midnight
function parseMins(time?: string | null): number | null {
  if (!time) return null;
  const match = time.match(/(\d+):(\d+)/);
  if (!match) return null;
  let hh = parseInt(match[1] || '0', 10);
  const mm = parseInt(match[2] || '0', 10);
  const lower = time.toLowerCase();
  if (lower.includes('pm') && hh < 12) hh += 12;
  if (lower.includes('am') && hh === 12) hh = 0;
  return hh * 60 + mm;
}

type HourSlot = {
  hour: number;
  type: TimelineType;
  color: string;
};

type MergedSlot = {
  type: TimelineType;
  color: string;
  span: number;
  hourStart: number;
};

const EMPTY_TYPE: TimelineType = 'OTHER';
const EMPTY_COLOR = '#E4E4E7';

function buildHourlySlots(segments: TimelineSegment[], startHour: number, endHour: number): HourSlot[] {
  const PRIORITY = ['LATE', 'EARLY', 'FORGOT_TO_CLOCK_TIME'];
  const sorted = [
    ...segments.filter(s => PRIORITY.includes(s.type)),
    ...segments.filter(s => !PRIORITY.includes(s.type)),
  ];

  const slots: HourSlot[] = [];

  for (let h = startHour; h <= endHour; h++) {
    const slotStart = h * 60;
    const slotEnd = slotStart + 60;

    const match = sorted.find(seg => {
      const sMin = parseMins(seg.startTime);
      const eMin = parseMins(seg.endTime);
      const effectiveStart = sMin !== null ? sMin : (eMin !== null ? 0 : null);
      const effectiveEnd = eMin !== null && eMin !== 0 ? eMin : 24 * 60;
      if (effectiveStart === null) return false;
      return effectiveStart < slotEnd && effectiveEnd > slotStart;
    });

    slots.push({
      hour: h,
      type: match ? match.type : EMPTY_TYPE,
      color: match ? (TIMELINE_COLOR_MAP[match.type] ?? match.color) : EMPTY_COLOR,
    });
  }

  return slots;
}

function mergeConsecutiveSlots(slots: HourSlot[]): MergedSlot[] {
  if (!slots.length) return [];
  const merged: MergedSlot[] = [];
  let cur: MergedSlot = { type: slots[0]!.type, color: slots[0]!.color, span: 1, hourStart: slots[0]!.hour };
  for (let i = 1; i < slots.length; i++) {
    const s = slots[i]!;
    if (s.type === cur.type) {
      cur.span++;
    } else {
      merged.push(cur);
      cur = { type: s.type, color: s.color, span: 1, hourStart: s.hour };
    }
  }
  merged.push(cur);
  return merged;
}

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
        {mergedSlots.map((slot, i) => {
          const colStart = slot.hourStart - startHour + 1;
          return (
            <div
              key={`label-${i}`}
              className="flex items-end pb-0.5"
              style={{ gridColumn: `${colStart} / span ${slot.span}`, gridRow: 1 }}
            >
              <span className="text-[10px] text-gray-400 leading-none">
                {String(slot.hourStart).padStart(2, '0')}
              </span>
              {slot.span >= 2 && (
                <span className="text-[10px] text-gray-400 leading-none ml-auto">
                  {String(slot.hourStart + slot.span).padStart(2, '0')}
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
                gridColumn: `${colStart} / span ${slot.span}`,
                gridRow: 2,
                background: slot.color,
                color: slot.type === 'BREAK' ? '#52525B' : 'white',
                marginLeft: '1px',
                marginRight: '1px',
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
