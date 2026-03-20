import { useEffect, useMemo, useState, type FC } from 'react';

import type { Shift, StaffSchedule } from '@/types';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { getDaysInMonth, isWeekend } from '../../../helper';
import { COL_W, ROW_GAP, ROW_H, ROW_PY, STAFF_COL_W } from '../../constants/constants';
import { ShiftCellBlock } from './shift-cell-block';
import type { ShiftManagementGridProps } from './shift-management-grid';

const getShiftsForDay = (schedules: StaffSchedule['schedules'], dateStr?: string): Shift[] =>
  schedules.find((s) => s.date === dateStr)?.shifts ?? [];

export const BodyV2: FC<Readonly<ShiftManagementGridProps>> = ({
  data,
  fromDetailsEmployee = false,
}) => {
  const { month, year } = useYearMonth();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(data?.map((d) => d.staff.id) ?? []),
  );
  useEffect(() => {
    if (fromDetailsEmployee && data?.length) {
      setExpandedIds(new Set([data?.[0]?.staff?.id ?? ""]))
    }
  }, [fromDetailsEmployee, data])
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const dateStrs = useMemo(() => days.map((d) => d.date), [days]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <tbody>
      {(data ?? []).map((item: StaffSchedule, si) => {
        const { staff, schedules } = item;
        const isExpanded = expandedIds.has(staff.id);
        const isEven = si % 2 !== 0;

        const maxShiftsPerDay = Math.max(
          1,
          ...dateStrs.map((dateStr) => getShiftsForDay(schedules, dateStr).length),
        );

        const hasMultipleRows = maxShiftsPerDay > 1;
        const visibleRowCount = isExpanded ? maxShiftsPerDay : 1;
        const blockHeight =
          ROW_PY * 2 + visibleRowCount * ROW_H + Math.max(0, visibleRowCount - 1) * ROW_GAP;

        return (
          <tr key={staff.id} className={cn(isEven && 'bg-[#F4F4F5]')}>
            {!fromDetailsEmployee && (
              <td
                className={cn(
                  'sticky left-0 z-20 border-b border-[#F4F4F5] align-top pt-3',
                  isEven ? 'bg-[#F4F4F5]' : 'bg-white',
                )}
                style={{ width: STAFF_COL_W, minWidth: STAFF_COL_W, height: blockHeight }}
              >
                <div
                  className="relative flex h-full items-start"
                  style={{ paddingTop: ROW_PY, paddingBottom: ROW_PY }}
                >
                  {hasMultipleRows && (
                    <button
                      className={cn(
                        'absolute left-2.5 top-5 z-20 transition-transform duration-200',
                        isExpanded ? 'rotate-0 text-[#3B82F6]' : '-rotate-90 text-[#A1A1AA]',
                      )}
                      onClick={() => toggleExpand(staff.id)}
                    >
                      {icons.arrowDownIndicator}
                    </button>
                  )}

                  <div className="min-w-0 flex-1 pl-8 pr-2">
                    <StaffInfo
                      avatarUrl={staff.avatar}
                      code={staff.code}
                      name={staff.name}
                      role={staff.position}
                      departments={staff?.departments}
                      rooms={staff?.rooms}
                    />
                  </div>
                </div>
              </td>
            )}

            {days.map((d, dIdx) => {
              const shifts = getShiftsForDay(schedules, dateStrs[dIdx]);

              return (
                <td
                  key={d.day}
                  className={cn(
                    'z-0 border-b border-[#F4F4F5] align-top p-0',
                    isWeekend(d.dayOfWeek) && 'bg-[#FFFBEB]/40',
                  )}
                  style={{ width: COL_W, minWidth: COL_W, height: blockHeight }}
                >
                  <div
                    className="flex h-full flex-col"
                    style={{ paddingTop: ROW_PY, paddingBottom: ROW_PY, gap: ROW_GAP }}
                  >
                    {Array.from({ length: visibleRowCount }).map((_, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-center justify-center px-2"
                        style={{ height: ROW_H }}
                      >
                        <ShiftCellBlock
                          cell={shifts[rIdx] ? shifts[rIdx] : null}
                          day={d}
                          record={item}
                        />
                      </div>
                    ))}
                  </div>
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};
