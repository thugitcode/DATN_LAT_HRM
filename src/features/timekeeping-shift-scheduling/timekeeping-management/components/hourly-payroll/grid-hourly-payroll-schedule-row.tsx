import { Fragment, type FC } from 'react';

import { cn } from '@/lib/utils';

import { HOURLY_PAYROLL_LEGEND_ITEMS } from '../../constants/data';
import type { HoursStatusEnum } from '../../types/index.type';
import type { DailyHourEntry } from '../../types/timekeeping-management.type';

export interface DayRecord {
  date: string;
  hours: number | null;
  status: HoursStatusEnum;
}

export interface LegendItem {
  status: HoursStatusEnum;
  label: string;
  color: string;
  shape?: 'line' | 'square';
}

const statusColorMap: Record<HoursStatusEnum, LegendItem> = HOURLY_PAYROLL_LEGEND_ITEMS.reduce(
  (acc, item) => {
    acc[item.status] = item;
    return acc;
  },
  {} as Record<HoursStatusEnum, LegendItem>,
);

interface GridHourlyPayrollScheduleRowProps {
  days: DailyHourEntry[];
  isHovered: boolean;
  hoveredDay: number | null;
  onDayEnter: (di: number) => void;
  onDayLeave: () => void;
}

export const GridHourlyPayrollScheduleRow: FC<GridHourlyPayrollScheduleRowProps> = ({
  days,
  isHovered,
  hoveredDay,
  onDayEnter,
  onDayLeave,
}) => {  
  return (
    <Fragment>
      {days.map((day, di) => {
        const isColHovered = hoveredDay !== null && hoveredDay === di;
        const legend = statusColorMap[day.status];

        return (
          <td
            key={di}
            onMouseEnter={() => onDayEnter(di)}
            onMouseLeave={onDayLeave}
            className={cn(
              'border-t border-[#11111126] text-center p-0 transition-colors duration-100',
              isHovered && isColHovered && 'bg-blue-100/60',
              !isHovered && isColHovered && 'bg-blue-50/60',
            )}
          >
            <div
              className="h-full flex flex-col items-center justify-center "
              title={`${day.hours}`}
            >
              <span className="text-xs font-medium" style={{ color: legend?.color }}>
                {day.hours ? `${day.hours}H` : '--'}
              </span>
            </div>
          </td>
        );
      })}
    </Fragment>
  );
};
