import { useCallback, useMemo, useState, type FC } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { TableEmpty } from '@/components/table/table-empty';
import { TableLoading } from '@/components/table/table-loading';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import { getDaysInMonth, mapToRow } from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { CELL_W, STICKY_COL_W, SUMMARY_COL_W } from '../../constants/data';
import { useWorkSheetColumns } from '../../hooks/use-work-sheet-columns';
import type { WorkSheetByShiftType } from '../../types/timekeeping-management.type';
import { GridStickyHeaderRow } from './grid-sticky-header-row';

const ROW_H = 48;

// ─── Badge ───────────────────────────────────────────────────
function AttendanceBadge({ code, wsdId }: { code: string; wsdId?: string }) {
  const open = useDrawer((state) => state.onOpen);
  const onClick = () => { if (wsdId) open(DrawerType.TIME_SHEET_DETAIL, wsdId); };

  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    'P':  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Đ'  },
    'Đ':  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Đ'  },
    'AB': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'VM' },
    'VM': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'VM' },
    'L':  { bg: 'bg-orange-100', text: 'text-orange-700', label: 'M'  },
    'M':  { bg: 'bg-orange-100', text: 'text-orange-700', label: 'M'  },
    'EL': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'S'  },
    'S':  { bg: 'bg-orange-100', text: 'text-orange-700', label: 'S'  },
    'LV': { bg: 'bg-green-100',  text: 'text-green-700',  label: 'P'  },
    'GT': { bg: 'bg-blue-200',   text: 'text-blue-800',   label: 'GT' },
    'N':  { bg: 'bg-gray-100',   text: 'text-gray-400',   label: 'N'  },
    'SC': { bg: 'bg-gray-100',   text: 'text-gray-400',   label: 'N'  },
  };
  const c = cfg[code] ?? { bg: 'bg-gray-100', text: 'text-gray-400', label: 'N' };
  if (c.label === 'N') {
    return (
      <div className="size-8 rounded-full bg-gray-100 overflow-hidden relative cursor-pointer flex items-center justify-center" onClick={onClick}>
        <svg className="absolute inset-0 size-full"><defs><pattern id="h" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#d1d5db" strokeWidth="1.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#h)"/></svg>
        <span className="z-10 text-[10px] font-semibold text-gray-400 relative">N</span>
      </div>
    );
  }
  return (
    <div
      className={cn('size-8 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform', c.bg, c.text)}
      onClick={onClick}
    >
      {c.label}
    </div>
  );
}

// ─── Build daysMap ───────────────────────────────────────────
interface WorkSheetByShiftGridProps {
  data?: WorkSheetByShiftType[];
  isLoading?: boolean;
}

function buildDaysMap(item: WorkSheetByShiftType): Record<string, Array<{ displayCode: string; workScheduleDetailId: string }>> {
  const map: Record<string, Array<{ displayCode: string; workScheduleDetailId: string }>> = {};
  for (const shiftEntry of item.shifts) {
    for (const [date, dayData] of Object.entries(shiftEntry.days)) {
      if (!dayData) continue;
      const code = dayData.displayCode;
      if (!code || code === 'N' || code === 'SC') continue;
      if (!map[date]) map[date] = [];
      map[date].push({ displayCode: code, workScheduleDetailId: dayData.workScheduleDetailId ?? '' });
    }
  }
  return map;
}


export const WorkSheetByShiftGrid: FC<Readonly<WorkSheetByShiftGridProps>> = ({
  data = [],
  isLoading,
}) => {
  const { month, year } = useYearMonth();
  const { summaryColumns } = useWorkSheetColumns();
  const [hoveredRow, setHoveredRow]               = useState<number | null>(null);
  const [hoveredDay, setHoveredDay]               = useState<string | null>(null);
  const [hoveredSummaryCol, setHoveredSummaryCol] = useState<string | null>(null);

  const days    = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const rows    = useMemo(() => data.map((item) => mapToRow(item, days)), [data, days]);
  // Build daysMap per nhân viên — gộp tất cả ca thực tế theo date
  const daysMaps = useMemo(() => data.map((item) => buildDaysMap(item)), [data]);

  const handleDayLeave = useCallback(() => setHoveredDay(null), []);
  console.log('[DEBUG] data length:', data?.length, '| daysMaps[0]:', daysMaps[0] ? Object.keys(daysMaps[0]).slice(0,3) : 'empty');
  const isEmpty = !isLoading && rows.length === 0;

  return (
    <div className="h-[calc(100vh-300px)] overflow-auto relative">
      <table
        className="border-separate border-spacing-0"
        style={{
          width: STICKY_COL_W + days.length * CELL_W + SUMMARY_COL_W * summaryColumns.length,
          tableLayout: 'fixed',
        }}
      >
        <GridStickyHeaderRow
          days={days}
          hoveredDay={hoveredDay !== null ? new Date(hoveredDay).getDate() : null}
          setHoveredDay={(d) => {
            if (d === null) { setHoveredDay(null); return; }
            // Tìm date string từ day number
            const found = days.find((day) => day.day === d);
            if (found) setHoveredDay(found.date);
          }}
          hoveredSummaryCol={hoveredSummaryCol}
          setHoveredSummaryCol={setHoveredSummaryCol}
          summaryColumns={summaryColumns}
        />

        <tbody>
          {isEmpty ? (
            <TableEmpty />
          ) : (
            rows.map((row: ReturnType<typeof mapToRow>, ri: number) => {
              const isRowHovered = hoveredRow === ri;
              const daysMap      = daysMaps[ri] ?? {};

              return (
                <tr
                  key={row.employee.id}
                  style={{ height: ROW_H }}
                  className={cn('transition-colors duration-100', isRowHovered ? 'bg-blue-50/40' : 'bg-white')}
                  onMouseEnter={() => setHoveredRow(ri)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Nhân viên */}
                  <td
                    style={{ minWidth: 320, width: 320 }}
                    className="sticky left-0 z-50 p-0 border-b px-2.5 border-r border-gray-100 bg-white py-2 align-middle"
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

                  {/* 1 ô per ngày — dùng daysMap đã gộp */}
                  {days.map((d) => {
                    const isCN     = d.dayOfWeek === 0;
                    const isColHov = hoveredDay === d.date;
                    const entries  = daysMap[d.date] ?? [];

                    return (
                      <td
                        key={d.date}
                        className={cn(
                          'border-b border-r border-gray-100 p-0 transition-colors duration-100',
                          isColHov && isRowHovered  ? 'bg-blue-100/60' : '',
                          isColHov && !isRowHovered ? 'bg-blue-50/40'  : '',
                          !isColHov && isCN         ? 'bg-red-50/20'   : '',
                        )}
                        style={{ width: CELL_W, minWidth: CELL_W }}
                        onMouseEnter={() => setHoveredDay(d.date)}
                        onMouseLeave={handleDayLeave}
                      >
                        <div className="flex items-center justify-center gap-0.5 h-full flex-wrap py-1">
                          {entries.length === 0 ? (
                            <AttendanceBadge code="N" />
                          ) : (
                            entries.map((entry: { displayCode: string; workScheduleDetailId: string }, ei: number) => (
                              <AttendanceBadge
                                key={ei}
                                code={entry.displayCode}
                                wsdId={entry.workScheduleDetailId}
                              />
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Summary */}
                  {summaryColumns.map((col) => {
                    const isColHov = hoveredSummaryCol === col.key;
                    return (
                      <td
                        key={col.key}
                        className="bg-white align-middle border-b border-gray-50 p-2"
                        style={{
                          width: SUMMARY_COL_W,
                          minWidth: SUMMARY_COL_W,
                          backgroundColor: isColHov ? '#F0F1FF' : isRowHovered ? 'rgba(239,246,255,0.4)' : '#ffffff',
                        }}
                      >
                        {col?.render?.(null, {
                          id: row.employee.id,
                          code: row.employee.code,
                          name: row.employee.name,
                          avatar: row.employee.avatar,
                          departments: row.employee.departments,
                          rooms: row.employee.rooms,
                          position: row.employee.role as StaffPosition,
                          summary: row.summary,
                          days: {} as any,
                          shift: row.shifts?.[0]?.shift as any,
                        }, ri)}
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