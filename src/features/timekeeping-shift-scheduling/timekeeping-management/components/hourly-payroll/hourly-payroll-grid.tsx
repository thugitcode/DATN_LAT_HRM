import { useMemo, useState, type FC } from 'react';

import { cn } from '@/lib/utils';
import { TableEmpty } from '@/components/table/table-empty';
import { TableLoading } from '@/components/table/table-loading';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import { getDaysInMonth } from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { SUMMARY_COL_W } from '../../constants/data';
import { useColumnsHourlyPayroll } from '../../hooks/use-columns-hourly-payroll';
import type {
  AttendanceByHoursResponse,
  DailyHourEntry,
} from '../../types/timekeeping-management.type';
import { GridHourlyPayrollScheduleRow } from './grid-hourly-payroll-schedule-row';
import { GridStickyHourlyHeaderRow } from './grid-sticky-hourly-header-row';

interface HourlyPayrollGridProps {
  data?: AttendanceByHoursResponse[];
  isLoading?: boolean;
}

export const HourlyPayrollGrid: FC<HourlyPayrollGridProps> = ({ data = [], isLoading }) => {
  const { month, year } = useYearMonth();
  const { totalHourColumns } = useColumnsHourlyPayroll();

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredSummaryCol, setHoveredSummaryCol] = useState<string | null>(null);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const isEmpty = !isLoading && data.length === 0;

  return (
    <div className="h-[calc(100vh-300px)] overflow-auto relative">
      <table className="table-fixed w-full border-separate border-spacing-0">
        <GridStickyHourlyHeaderRow
          days={days}
          hoveredDay={hoveredDay}
          setHoveredDay={setHoveredDay}
          hoveredSummaryCol={hoveredSummaryCol}
          setHoveredSummaryCol={setHoveredSummaryCol}
          totalHourColumns={totalHourColumns}
        />

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
                    'h-16 transition-colors duration-100',
                    hoveredRow === ri ? 'bg-blue-50/40' : 'bg-white',
                  )}
                  onMouseEnter={() => setHoveredRow(ri)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td
                    className={cn(
                      'sticky left-0 border-r border-[#11111126] z-10 w-52 px-2.25 py-3 p-0',
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

                  {totalHourColumns.map((col) => {
                    const isColHovered = hoveredSummaryCol === col.key;

                    return (
                      <td
                        key={col.key}
                        className="border-b border-l border-gray-100 p-0 text-center align-middle bg-white transition-colors duration-100"
                        style={{
                          width: SUMMARY_COL_W,
                          minWidth: SUMMARY_COL_W,
                          backgroundColor: isColHovered ? '#EFF6FF' : '#ffffff',
                        }}
                      >
                        {col.render(null, row)}
                      </td>
                    );
                  })}
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
