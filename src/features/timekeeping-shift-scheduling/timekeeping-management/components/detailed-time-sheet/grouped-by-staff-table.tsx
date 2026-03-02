'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import dayjs from 'dayjs';

import type { ShiftManagementParams } from '@/types';
import { STANDARD_HOURS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import {
  fillMissingDaysWithDayjs,
  getTotalDaysInMonth,
} from '@/features/timekeeping-shift-scheduling/helper';

import { useDetailsTimeSheetList } from '../../hooks/use-detailed-time-sheet';
import type { FlatRow } from '../../types/index.type';
import { StickyRowGroupStaff } from './sticky-row-group-staff';

const columns = [
  { className: 'w-[150px] text-left', key: 'date', label: 'NGÀY' },
  { className: 'w-[125px] text-left', key: 'shiftCode', label: 'MÃ CA' },
  { className: 'w-[185px] text-left', key: 'standardHours', label: 'GIỜ CÔNG CHUẨN' },
  { className: 'text-center', key: 'checkIn', label: 'GIỜ VÀO' },
  { className: 'text-center', key: 'checkOut', label: 'GIỜ RA' },
  { className: 'text-center', key: 'lateMinutes', label: 'ĐI MUỘN' },
  { className: 'text-center', key: 'earlyMinutes', label: 'VỀ SỚM' },
  { className: 'text-center', key: 'workCount', label: 'CÔNG' },
  { className: 'text-center', key: 'totalWorkHours', label: 'TỔNG GIỜ' },
  { className: 'text-center', key: 'overtimeHours', label: 'TĂNG CA' },
  { className: 'text-center', key: 'compHours', label: 'GIỜ BÙ' },
];

export function GroupedTable() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    // () => new Set(hourlyPayrollMock.map((staff) => staff.id))
    () => new Set(),
  );

  const { filters } = useQueryFilter<ShiftManagementParams>();

  const { startDate, endDate } = useMemo(() => {
    const monthStr = filters.month ?? dayjs().format('YYYY-MM');
    const monthDate = dayjs(monthStr, 'YYYY-MM');

    return {
      startDate: monthDate.startOf('month').format('YYYY-MM-DD'),
      endDate: monthDate.endOf('month').format('YYYY-MM-DD'),
    };
  }, [filters.month]);

  const ROW_HEIGHT = 52;
  const TABLE_HEIGHT = 560;
  const { onOpen } = useDrawer((state) => state);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [stickyGroup, setStickyGroup] = useState<FlatRow | null>(null);

  const { data, isLoading } = useDetailsTimeSheetList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
  });

  const flatRows = useMemo<FlatRow[]>(() => {
    const rows: FlatRow[] = [];

    data?.data.forEach((shift, idx) => {
      const staffIndex = idx + 1;
      const isExpanded = expandedGroups.has(shift.staff?.code);
      const allDays = fillMissingDaysWithDayjs(
        shift.days,
        data?.metadata?.fromDate as string,
        data?.metadata?.toDate as string,
      );

      rows.push({
        type: 'group',
        key: `group-${shift.staff?.code}`,
        staff: shift.staff,
        index: staffIndex,
        isExpanded,
      });

      if (isExpanded) {
        allDays.forEach((day, dayIdx) => {
          rows.push({
            type: 'shift',
            key: `shift-${shift.staff?.code}-${dayIdx}`,
            staffId: shift.staff?.code,
            shift: day,
            isLast: dayIdx === allDays.length - 1,
          });
        });
      }
    });

    return rows;
  }, [expandedGroups, isLoading]);

  // Build an index: for each flat-row index, which group does it belong to?
  const groupIndexMap = useMemo(() => {
    const map: FlatRow[] = [];
    let currentGroup: FlatRow | null = null;
    for (const row of flatRows) {
      if (row.type === 'group') {
        currentGroup = {
          type: 'group',
          key: `group-${row.staff.code}`,
          staff: row.staff,
          index: row.index,
          isExpanded: row.isExpanded,
        };
      }
      map.push(currentGroup!);
    }
    return map;
  }, [flatRows, expandedGroups]);
  // Attach a scroll listener to the virtualized scroll container
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Find the actual scrollable element in the HeroUI Table
    let actualScroller: HTMLElement | null = null;

    // Try multiple selectors to find the scroll container
    const candidates = [
      wrapper.querySelector('[role="table"]') as HTMLElement | null,
      wrapper.querySelector('[style*="overflow"]') as HTMLElement | null,
      wrapper.querySelector('div[class*="overflow"]') as HTMLElement | null,
    ];

    // Find the first element with scrollTop property (indicating it's scrollable)
    for (const candidate of candidates) {
      if (candidate && candidate.scrollHeight > candidate.clientHeight) {
        actualScroller = candidate;
        break;
      }
    }

    if (!actualScroller) {
      return;
    }

    function handleScroll() {
      const scrollTop = actualScroller!.scrollTop;
      const topRowIndex = Math.floor(scrollTop / ROW_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(topRowIndex, groupIndexMap.length - 1));

      // Find which group header is currently being scrolled past
      let currentGroup: FlatRow | null = null;
      // for (let i = clampedIndex; i >= 0; i--) {
      //   const row = flatRows[i]
      //   if (row && row.type === "group") {
      currentGroup = groupIndexMap[clampedIndex] ?? null;
      //     break
      //   }
      // }

      setStickyGroup(currentGroup);
    }

    actualScroller.addEventListener('scroll', handleScroll, { passive: true });
    return () => actualScroller.removeEventListener('scroll', handleScroll);
  }, [groupIndexMap, flatRows]);

  const toggleGroup = useCallback((staffId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(staffId)) next.delete(staffId);
      else next.add(staffId);
      return next;
    });
  }, []);

  const totalStaff = data?.data?.length ?? 0;
  const monthStr = typeof data?.metadata?.month === 'string' ? data?.metadata?.month : '';
  const totalShifts = monthStr
    ? getTotalDaysInMonth(Number(monthStr.split('-')[0]), Number(monthStr.split('-')[1])) *
      totalStaff
    : 0;

  const renderShiftCell = useCallback(
    (row: FlatRow, columnKey: React.Key) => {
      if (row.type === 'group') {
        if (columnKey !== 'date') return null;

        return <StickyRowGroupStaff row={row} toggleGroup={toggleGroup} key={row.staff.code} />;
      }

      // ── Shift row ───────────────────────────────────────────────
      const { shift, isLast } = row;

      const colorLate = 'text-[#D55829]';
      const colorEarly = 'text-[#73C9C6]';

      switch (columnKey) {
        case 'date':
          return (
            <span className={cn('flex font-medium text-foreground', 'pl-6', 'py-2.5 px-4')}>
              {dayjs(shift.date).format('DD/MM/YYYY')}
            </span>
          );

        case 'shiftCode':
          return (
            <span className="fontflex -medium text-foreground py-2.5 px-4">
              {shift.shiftCode || '--'}
            </span>
          );

        case 'standardHours':
          return (
            <span className={cn('flex text-muted-foreground py-2.5 px-4', 'hidden sm:flex')}>
              {STANDARD_HOURS}
            </span>
          );

        case 'checkIn':
          return (
            <span
              className={cn(
                'flex text-muted-foreground py-2.5 px-4',
                'hidden sm:flex justify-center',
              )}
            >
              {shift.checkInTime || '--'}
            </span>
          );

        case 'checkOut':
          return (
            <span
              className={cn(
                'flex text-muted-foreground py-2.5 px-4',
                'hidden sm:flex justify-center',
              )}
            >
              {shift.checkOutTime || '--'}
            </span>
          );

        case 'lateMinutes':
          return (
            <span
              className={cn(
                shift.lateMinutes > 0 ? colorLate : 'text-muted-foreground',
                'hidden md:flex justify-center py-2.5 px-4',
              )}
            >
              {shift.lateMinutes > 0 ? `${shift.lateMinutes}` : '--'}
            </span>
          );

        case 'earlyMinutes':
          return (
            <span
              className={cn(
                shift.earlyMinutes > 0 ? colorEarly : 'text-muted-foreground',
                'hidden md:flex justify-center py-2.5 px-4',
              )}
            >
              {shift.earlyMinutes > 0 ? `${shift.earlyMinutes}` : '--'}
            </span>
          );

        case 'workCount':
          return (
            <span className={cn('flex text-foreground py-2.5 px-4', 'justify-center')}>
              {shift.workCount ? shift.workCount.toFixed(1) : '0'}
            </span>
          );

        case 'totalWorkHours':
          return (
            <span
              className={cn(
                'flex text-muted-foreground py-2.5 px-4',
                'hidden lg:flex justify-center',
              )}
            >
              {shift.totalWorkHours !== null ? `${shift?.totalWorkHours.toFixed(1)}` : '--'}
            </span>
          );

        case 'overtimeHours':
          return (
            <span className={cn('flex py-2.5 px-4', 'hidden lg:flex justify-center')}>
              {shift.overtimeHours > 0 ? `${shift.overtimeHours.toFixed(1)}` : '--'}
            </span>
          );

        case 'compHours':
          return (
            <span className={cn('flex py-2.5 px-4', 'hidden xl:flex justify-center')}>
              {shift.compHours > 0 ? `${shift.compHours.toFixed(1)}` : '--'}
            </span>
          );

        default:
          return null;
      }
    },
    [toggleGroup],
  );

  return (
    <div className="w-full overflow-hidden rounded-xl bg-card shadow-sm bg-white p-4">
      <div className="overflow-x-auto relative" ref={wrapperRef}>
        {/* Sticky group header overlay */}
        {stickyGroup && (
          <div
            className="pointer-events-auto absolute right-0 left-0 z-20 flex items-center gap-1 from-group-header to-group-header/80 ps-4 w-[97.7%] max-md:w-[96.7%]"
            style={{ top: 64, height: ROW_HEIGHT }}
          >
            <StickyRowGroupStaff
              row={stickyGroup}
              toggleGroup={toggleGroup}
              key={stickyGroup.key}
            />
          </div>
        )}
        <Table
          // isStriped
          isVirtualized
          isHeaderSticky
          maxTableHeight={TABLE_HEIGHT}
          rowHeight={ROW_HEIGHT}
          radius="none"
          classNames={{
            wrapper: 'border-0 rounded-none pt-0',
            th: cn(
              'h-14 bg-[#F4F4F5] text-[#71717A] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 text-left',
              // "!rounded-none",
              // "first:!rounded-bl-0",
              // "first:!rounded-tl-lg",
              // "last:!rounded-tr-lg",
              // "last:!rounded-br-0"
            ),
            td: 'p-0',
            tr: 'rounded-0',
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className={cn(
                  column.key === 'date' && 'rounded-tl-lg',
                  column.key === 'compensatory' && 'rounded-tr-lg text-center',
                  column.className,
                )}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody items={flatRows}>
            {(row) => (
              <TableRow
                key={row.key}
                className={cn(
                  // row.type === "shift" &&
                  // "border-b border-[#11111126]",
                  row.type === 'group' && 'cursor-pointer',
                )}
              >
                {(columnKey) => {
                  const col = columns.find((c) => c.key === columnKey);
                  const alignClass = `text-${col?.textAlign}`;
                  return (
                    <TableCell
                      className={cn(
                        alignClass,
                        row.type === 'shift' && 'border-b border-[#11111126]',
                      )}
                      colSpan={row.type === 'shift' ? 1 : columns.length}
                    >
                      {renderShiftCell(row, columnKey)}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Hiển thị {totalStaff} nhân viên • {totalShifts} bản ghi ca làm việc
      </p>
    </div>
  );
}
