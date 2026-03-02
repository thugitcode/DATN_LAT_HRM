import { useMemo, useState, type FC } from 'react';

import type { ApiResponse } from '@/types';
import { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { TableEmpty } from '@/components/table/table-empty';
import { TableLoading } from '@/components/table/table-loading';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import { getDaysInMonth } from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import type {
  AttendanceByHoursResponse,
  DailyHourEntry,
} from '../../types/timekeeping-management.type';
import { GridStickyHeaderRow } from '../work-sheet-by-shift/grid-sticky-header-row';
import { GridHourlyPayrollScheduleRow, type DayRecord } from './grid-hourly-payroll-schedule-row';

interface HourlyPayrollGridProps {
  data?: AttendanceByHoursResponse[];
  isLoading?: boolean;
}

export const HourlyPayrollGrid: FC<HourlyPayrollGridProps> = ({ data = [], isLoading }) => {
  const { month, year } = useYearMonth();

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const isEmpty = !isLoading && data.length === 0;

  return (
    <div className="h-[calc(100vh-300px)] overflow-auto relative">
      <table className="table-fixed w-full border-separate border-spacing-0">
        <GridStickyHeaderRow days={days} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />

        <tbody>
          {isEmpty ? (
            <TableEmpty />
          ) : (
            data?.map((row, ri) => {
              const allDays: DailyHourEntry[] = Object.values(row.days);

              return (
                <tr
                  key={row.staffId}
                  className={cn(
                    'h-16 transition-colors duration-100 ',
                    hoveredRow === ri ? 'bg-blue-50/40' : 'bg-white',
                  )}
                  onMouseEnter={() => setHoveredRow(ri)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td
                    className={cn(
                      'sticky left-0 border-r border-[#11111126] z-10 w-52 px-2.25  py-3 p-0 ',
                      'transition-colors duration-100',
                      ri % 2 ? 'bg-[#F4F4F5]' : 'bg-white',
                    )}
                  >
                    <StaffInfo
                      avatarUrl=""
                      code={row.staffCode}
                      name={row.staffName}
                      role={row.position}
                      departments={row.departments}
                      rooms={row.rooms}
                    />
                  </td>

                  <GridHourlyPayrollScheduleRow
                    days={allDays}
                    isHovered={hoveredRow === ri}
                    hoveredDay={hoveredDay}
                    onDayEnter={setHoveredDay}
                    onDayLeave={() => setHoveredDay(null)}
                  />
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {isLoading && <TableLoading />}
    </div>
  );
};
