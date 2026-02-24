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
    <div className={cn('flex w-full flex-col  rounded-xl ', 'h-[calc(100vh-304px)]')}>
      <div className="overflow-x-auto flex flex-col flex-1 min-h-0">
        <DayHeader data={data} />
        <Body data={data} />
      </div>
    </div>
  );
};
