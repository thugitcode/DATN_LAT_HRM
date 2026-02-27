import { type FC } from 'react';

import type { StaffSchedule } from '@/types';
import { cn } from '@/lib/utils';
import { TableEmpty } from '@/components/table/table-empty';
import { TableLoading } from '@/components/table/table-loading';

import { BodyV2 } from './body-v2';
import { DayHeader } from './day-header';

export interface ShiftManagementGridProps {
  data?: StaffSchedule[];
  isLoading?: boolean;
}

export const ShiftManagementGrid: FC<ShiftManagementGridProps> = ({ data, isLoading }) => {
  const isEmpty = !isLoading && !data?.length;

  return (
    <div className={cn('w-full rounded-xl relative overflow-auto', 'h-[calc(100vh-304px)]')}>
      <table className="border-collapse min-w-max w-full table-fixed">
        <DayHeader data={data} />
        {isEmpty ? <TableEmpty /> : <BodyV2 data={data} />}
      </table>

      {isLoading && <TableLoading />}
    </div>
  );
};
