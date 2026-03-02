'use client';

import { Card, CardBody, Chip } from '@heroui/react';

interface TimeSlot {
  time: string;
  label: string;
  color: string;
}

interface ShiftTimelineProps {
  timeSlots: TimeSlot[];
}

export function ShiftTimeline({ timeSlots }: ShiftTimelineProps) {
  return (
    <div className="flex gap-2 items-end overflow-x-auto px-6">
      {timeSlots.map((slot, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2 min-w-fit flex-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{slot.time}</span>
          <div
            className={`h-7 w-16 rounded-md ${slot.color} flex items-center w-full justify-center text-white text-center text-xs font-semibold transition-transform hover:scale-105`}
          >
            {slot.label}
          </div>
        </div>
      ))}
    </div>
  );
}
