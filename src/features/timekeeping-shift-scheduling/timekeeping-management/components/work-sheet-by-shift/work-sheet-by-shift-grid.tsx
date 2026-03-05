import { useCallback, useMemo, useState, type FC } from 'react';

import { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { TableEmpty } from '@/components/table/table-empty';
import { TableLoading } from '@/components/table/table-loading';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import { getDaysInMonth, mapToRow } from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';
import { ROW_H } from '@/features/timekeeping-shift-scheduling/shift-management/constants/constants';

import { CELL_W, STICKY_COL_W, SUMMARY_COL_W } from '../../constants/data';
import { SUMMARY_COLUMNS } from '../../hooks/use-work-sheet-columns';
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
  const [hoveredSummaryCol, setHoveredSummaryCol] = useState<string | null>(null);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const rows = useMemo(() => data.map((item) => mapToRow(item, days)), [data, days]);

  const handleDayLeave = useCallback(() => setHoveredDay(null), []);
  const isEmpty = !isLoading && rows.length === 0;

  return (
    <div className="h-[calc(100vh-300px)] overflow-auto relative">
      <table
        className="border-separate border-spacing-0"
        style={{
          width: STICKY_COL_W + days.length * CELL_W + SUMMARY_COL_W * SUMMARY_COLUMNS.length,
          tableLayout: 'fixed',
        }}
      >
        <GridStickyHeaderRow
          days={days}
          hoveredDay={hoveredDay}
          setHoveredDay={setHoveredDay}
          hoveredSummaryCol={hoveredSummaryCol}
          setHoveredSummaryCol={setHoveredSummaryCol}
        />

        <tbody>
          {isEmpty ? (
            <TableEmpty />
          ) : (
            rows.map((row, ri) => {
              const isRowHovered = hoveredRow === ri;
              const shiftCount = row.shifts.length;

              return (
                <tr
                  key={row.employee.id}
                  style={{ height: ROW_H * shiftCount }}
                  className={cn(
                    'transition-colors duration-100',
                    isRowHovered ? 'bg-blue-50/40' : 'bg-white',
                  )}
                  onMouseEnter={() => setHoveredRow(ri)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Sticky staff info — rowspan toàn bộ shifts */}
                  <td
                    style={{ minWidth: 320, width: 320 }}
                    className={cn(
                      'sticky left-0 z-50 p-0 border-b px-2.5 border-r border-gray-100 bg-white py-2',
                      'transition-colors duration-100 align-middle',
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

                  {/* Mỗi shift = 1 dòng schedule xếp dọc trong cùng td */}
                  <td colSpan={days.length} className="p-0 border-b border-gray-100">
                    <table
                      className="w-full border-separate border-spacing-0"
                      style={{ tableLayout: 'fixed' }}
                    >
                      <tbody>
                        {row.shifts.map((shiftEntry) => (
                          <tr key={shiftEntry.shift.id} style={{ height: ROW_H }}>
                            <GridScheduleRow
                              schedule={shiftEntry.schedule}
                              runs={shiftEntry.runs}
                              isHovered={isRowHovered}
                              hoveredDay={hoveredDay}
                              onDayEnter={setHoveredDay}
                              onDayLeave={handleDayLeave}
                            />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>

                  {/* Summary — mỗi shift 1 dòng xếp dọc */}
                  {SUMMARY_COLUMNS.map((col) => {
                    const isColHovered = hoveredSummaryCol === col.key;

                    return (
                      <td
                        key={col.key}
                        className="border-b border-l border-gray-100 p-0 align-top bg-white transition-colors duration-100"
                        style={{
                          width: SUMMARY_COL_W,
                          minWidth: SUMMARY_COL_W,
                          backgroundColor: isColHovered
                            ? '#EFF6FF'
                            : isRowHovered
                              ? 'rgba(239,246,255,0.4)'
                              : '#ffffff',
                        }}
                      >
                        <div className="flex flex-col">
                          {row.shifts.map((shiftEntry) => (
                            <div
                              key={shiftEntry.shift.id}
                              className="flex items-center justify-center text-sm text-black"
                              style={{ height: ROW_H }}
                            >
                              {col.render(null, {
                                ...shiftEntry,
                                id: row.employee.id,
                                code: row.employee.code,
                                name: row.employee.name,
                                avatar: row.employee.avatar,
                                departments: row.employee.departments,
                                rooms: row.employee.rooms,
                                position: row.employee.role as StaffPosition,
                              })}
                            </div>
                          ))}
                        </div>
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
