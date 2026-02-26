import { useMemo, useState } from 'react';

import { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import { getDaysInMonth } from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { GridStickyHeaderRow } from '../work-sheet-by-shift/grid-sticky-header-row';
import { GridHourlyPayrollScheduleRow, type DayRecord } from './grid-hourly-payroll-schedule-row';
import { hourlyPayrollMock } from './moc/hourly-payroll.mock';

export const HourlyPayrollGrid = () => {
  const { month, year } = useYearMonth();

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  return (
    <div
      className="h-[calc(100vh-356px)] overflow-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
    >
      <table className="table-fixed w-full border-separate border-spacing-0">
        <GridStickyHeaderRow days={days} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />

        <tbody>
          {hourlyPayrollMock.map((row, ri) => {
            const allDays: DayRecord[] = row.weeks.flatMap((week) => week.days);

            return (
              <tr
                key={row.id}
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
                    departmentName={row.department}
                    name={row.staffName}
                    role={StaffPosition.STAFF}
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
          })}
        </tbody>
      </table>
    </div>
  );
};
