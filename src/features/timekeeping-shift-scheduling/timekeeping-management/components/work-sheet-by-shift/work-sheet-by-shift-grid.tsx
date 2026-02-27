import { useCallback, useMemo, useState, type FC } from 'react';

import { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { TableLoading } from '@/components/table/table-loading';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import {
  getDaysInMonth,
  groupByStaff,
  mapToRow,
} from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';
import {
  COL_W,
  ROW_H,
} from '@/features/timekeeping-shift-scheduling/shift-management/constants/constants';

import { CELL_W } from '../../constants/data';
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

  const rows = useMemo(() => {
    const grouped = groupByStaff(data);
    return Array.from(grouped.values()).map((item) => mapToRow(item, days));
  }, [data, days]);

  const handleDayLeave = useCallback(() => setHoveredDay(null), []);
  const isEmpty = !isLoading && rows.length === 0;

  return (
    <div className="h-[calc(100vh-356px)] overflow-auto relative">
      <table
        className="border-separate border-spacing-0"
        style={{ width: 400 + days.length * CELL_W }}
      >
        <GridStickyHeaderRow days={days} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />

        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={days.length + 1} className="border-0 p-0">
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-14 text-gray-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M3 6h18M3 14h10m-7 4h4"
                    />
                  </svg>
                  <span className="text-lg font-medium">Không có dữ liệu</span>
                  <span className="text-base text-gray-400">
                    Thử thay đổi bộ lọc hoặc khoảng thời gian
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => {
              const isRowHovered = hoveredRow === ri;

              return (
                <tr
                  key={row.employee.id}
                  style={{ height: ROW_H }}
                  className={cn(
                    'transition-colors duration-100',
                    isRowHovered ? 'bg-blue-50/40' : 'bg-white',
                  )}
                  onMouseEnter={() => setHoveredRow(ri)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td
                    style={{ minWidth: COL_W, width: COL_W }}
                    className={cn(
                      'sticky left-0 z-10 p-0 border-b px-2.5 border-r border-gray-100',
                      'transition-colors duration-100',
                      isRowHovered ? 'bg-blue-50/60' : 'bg-white',
                    )}
                  >
                    <StaffInfo
                      avatarUrl={row.employee.avatar ?? ''}
                      code={row.employee.code}
                      departmentName={row.employee.departmentName}
                      name={row.employee.name}
                      role={row.employee.role as StaffPosition}
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
