import { type FC } from 'react';

import type { StaffSchedule } from '@/types';
import { cn } from '@/lib/utils';

import { Body } from './body';
import { DayHeader } from './day-header';

export interface ShiftManagementGridProps {
  data?: StaffSchedule[];
}

export const ShiftManagementGrid: FC<ShiftManagementGridProps> = ({ data }) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col bg-white rounded-xl border border-[#E4E4E7] ',
        'h-[calc(100vh-320px)]',
      )}
    >
      <div className="overflow-x-auto flex flex-col flex-1 min-h-0">
        <DayHeader />
        <Body data={data} />
      </div>
    </div>
  );
};
