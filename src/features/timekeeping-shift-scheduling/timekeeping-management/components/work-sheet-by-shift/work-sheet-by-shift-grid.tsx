import { useCallback, useMemo, useState, type FC } from 'react';

import { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { TableEmpty } from '@/components/table/table-empty';
import { TableLoading } from '@/components/table/table-loading';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import {
  getDaysInMonth,
  groupByStaff,
  mapToRow,
} from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';
import { ROW_H } from '@/features/timekeeping-shift-scheduling/shift-management/constants/constants';

import { CELL_W, STICKY_COL_W } from '../../constants/data';
import type { WorkSheetByShiftType } from '../../types/timekeeping-management.type';
import { GridScheduleRow } from './grid-schedule-row';
import { GridStickyHeaderRow } from './grid-sticky-header-row';

interface WorkSheetByShiftGridProps {
  data?: WorkSheetByShiftType[];
  isLoading?: boolean;
}

export const WorkSheetByShiftGrid: FC<Readonly<WorkSheetByShiftGridProps>> = ({
  data = [],
  isLoading,
}) => {
  const { month, year } = useYearMonth();

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  // const rows = useMemo(() => {
  //   const grouped = groupByStaff(data);
  //   return Array.from(grouped.values()).map((item) => mapToRow(item, days));
  // }, [data, days]);

  const rows = useMemo(() => {
    return data.map((item) => mapToRow(item, days));
  }, [data, days]);

  const handleDayLeave = useCallback(() => setHoveredDay(null), []);
  const isEmpty = !isLoading && rows.length === 0;

  return (
    <div className="h-[calc(100vh-300px)] overflow-auto relative">
      <table
        className="border-separate border-spacing-0"
        style={{
          width: STICKY_COL_W + days.length * CELL_W,
          tableLayout: 'fixed',
        }}
      >
        <GridStickyHeaderRow days={days} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />

        <tbody>
          {isEmpty ? (
            <TableEmpty />
          ) : (
            rows.map((row, ri) => {
              const isRowHovered = hoveredRow === ri;

              return (
                <tr
                  key={row.employee.id}
                  style={{ height: ROW_H }}
                  className={cn(
                    'transition-colors duration-100 bg-white',
                    isRowHovered ? 'bg-blue-50/40' : 'bg-white',
                  )}
                  onMouseEnter={() => setHoveredRow(ri)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td
                    style={{ minWidth: 320, width: 320 }}
                    className={cn(
                      'sticky left-0 z-50 p-0 border-b px-2.5 border-r border-gray-100 bg-white',
                      'transition-colors duration-100',
                      // isRowHovered ? 'bg-blue-50/60!' : '',
                    )}
                  >
                    <StaffInfo
                      avatarUrl={row.employee.avatar ?? ''}
                      code={row.employee.code}
                      departmentName={row.employee.departmentName}
                      name={row.employee.name}
                      role={row.employee.role as StaffPosition}
                      departments={row.employee.departments}
                      rooms={row.employee.rooms}
                    />
                  </td>

                  <GridScheduleRow
                    schedule={row.schedule}
                    runs={row.runs}
                    isHovered={isRowHovered}
                    hoveredDay={hoveredDay}
                    onDayEnter={setHoveredDay}
                    onDayLeave={handleDayLeave}
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
