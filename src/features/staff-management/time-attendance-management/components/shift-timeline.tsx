'use client';

import { groupTimeSlots } from "../helpers";


interface TimeSlot {
  time: string;
  label: string;
  color: string;
}

interface ShiftTimelineProps {
  timeSlots: TimeSlot[];
}

export function ShiftTimeline({ timeSlots }: ShiftTimelineProps) {
  const grouped = groupTimeSlots(timeSlots)
  return (
    <div className="overflow-x-auto px-6 py-0 h-full">
      <div
        className="relative grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${timeSlots.length}, minmax(80px, 1fr))`,
        }}
      >
        {/* Grid lines background */}
        {timeSlots.map((slot, i) => (
          <div
            key={i}
            className="text-xs text-center text-gray-500 py-0"
          >
            {slot.time}
          </div>
        ))}

        {/* Timeline blocks */}
        {grouped.map((slot, i) => (
          <div
            key={i}
            className={`
          ${slot.color}
          absolute
          h-7
          flex items-center justify-center
          text-white text-[14px] py-0.5 leading-5 font-normal
          rounded-md
          w-full
          transition-all
          hover:scale-101
          hover:shadow-lg
          cursor-pointer
        `}
            style={{
              gridColumn: `${slot.startIndex + 1} / span ${slot.count}`,
              top: "26px",
            }}
          >
            {slot.label}
          </div>
        ))}
      </div>
    </div>
  );
}
