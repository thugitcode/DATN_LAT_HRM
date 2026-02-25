// schedule-cell.tsx
import type { FC } from 'react';

// import type { ScheduleCellData } from '../../types/type';

interface ScheduleCellProps {
  cell: any | null;
}

export const ScheduleCell: FC<ScheduleCellProps> = ({ cell }) => {
  if (!cell) return null;

  return (
    <div className="rounded-md px-2 py-1 text-xs bg-blue-50 text-blue-700 truncate">
      <div className="font-semibold truncate">{cell.code}</div>
      <div className="text-[10px] text-blue-500">{cell.time}</div>
    </div>
  );
};
