import { formatTime } from '@/lib/utils';

import { TIMELINE_COLOR_MAP } from '../helpers';
import type { TimelineSegment } from '../types';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

interface ShiftTimelineProps {
  timeline: TimelineSegment[];
}

export function ShiftTimeline({ timeline }: ShiftTimelineProps) {
  const { t } = useTranslation(NAMESPACES.COMMON)
  return (
    <div className="overflow-x-auto px-6 py-0 h-full">
      <div
        className="relative grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${timeline?.length ?? 0}, minmax(80px, 1fr))`,
        }}
      >
        {/* Grid lines background */}
        {timeline?.map((slot, i) => (
          <div className="flex justify-between h-2.5 px-2" key={i}>
            <div className="text-xs text-center text-gray-500 py-0">
              {formatTime(slot.startTime)}
            </div>
            <div
              // key={i}
              className="text-xs text-center text-gray-500 py-0"
            >
              {formatTime(slot.endTime)}
            </div>
          </div>
        ))}

        {/* Timeline blocks */}
        {timeline?.map((slot, i) => (
          <div
            key={i}
            className={`
          absolute
          h-7
          flex items-center justify-center
          text-white text-[14px] py-0.5 leading-5 font-normal
          rounded-lg
          w-full
          transition-all
          hover:scale-101
          hover:shadow-lg
          cursor-pointer
        `}
            style={{
              gridColumn: `${i + 1} / span ${1}`,
              top: '26px',
              background: TIMELINE_COLOR_MAP?.[slot.type],
              color: slot.type === 'BREAK' ? 'black' : 'white',
            }}
          >
            {t(`options.timeline.${slot.type}`)}
          </div>
        ))}
      </div>
    </div>
  );
}
