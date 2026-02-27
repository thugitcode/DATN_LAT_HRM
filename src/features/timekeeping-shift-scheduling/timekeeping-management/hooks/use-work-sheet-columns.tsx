import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/types';
import { dayNames, getWeeksInMonth } from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { STATUS_COLOR_MAP } from '../constants/data';
import type { Summary, WorkDay } from '../types/timekeeping-management.type';

export interface WorkSheetByShiftRow {
  id: string;
  code: string;
  name: string;
  avatar: string | null;
  departmentName: string;
  position: string;
  days: Record<string, WorkDay>;
  summary: Summary;
}

export const useWorkSheetColumns = () => {
  const { month, year } = useYearMonth();
  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const columns: Column<WorkSheetByShiftRow>[] = useMemo(() => {
    const base: Column<WorkSheetByShiftRow>[] = [
      {
        key: 'stt',
        title: 'STT',
        align: 'center',
        render: (_, __, index) => (index ?? 0) + 1,
      },
      {
        key: 'departmentName',
        title: 'KHOA/PHÒNG',
        render: (_, record) => (
          <div className="text-sm text-gray-700 w-50">{record.departmentName}</div>
        ),
      },
      {
        key: 'code',
        title: 'MÃ NHÂN VIÊN',
        render: (_, record) => (
          <div className="text-sm w-32.5 font-mono text-gray-600">{record.code}</div>
        ),
      },
      {
        key: 'name',
        title: 'TÊN NHÂN VIÊN',
        render: (_, record) => (
          <div className="text-sm font-medium text-gray-800 w-50">{record.name}</div>
        ),
      },
    ];

    weeks.forEach((week) => {
      const weekCol: Column<WorkSheetByShiftRow> = {
        key: `week-${week.weekNumber}`,
        title: (
          <div className="flex items-center justify-center gap-1 text-xs font-semibold uppercase text-nowrap">
            <span>TUẦN {week.weekNumber}:</span>
            <span>
              ({week.startDay}/{month + 1} – {week.endDay}/{month + 1})
            </span>
          </div>
        ),
        children: week.days.map((day) => {
          const dateObj = new Date(year, month, day.day);
          const dateString = dateObj.toISOString().split('T')[0];
          const isCN = day.dayOfWeek === 0 || day.dayOfWeek === 6;

          return {
            key: `day-${week.weekNumber}-${day.day}`,
            title: (
              <div
                className={cn(
                  'flex flex-col items-center gap-1 text-xs font-normal',
                  isCN ? 'text-red-400' : 'text-gray-400',
                )}
              >
                <span className="uppercase">{dayNames[day.dayOfWeek]}</span>
                <span>{day.day}</span>
              </div>
            ),
            width: 56,
            align: 'center' as const,
            render: (_, record) => {
              const dayData = record.days[dateString];

              if (!dayData) {
                return (
                  <div className="flex items-center justify-center">
                    <span className="text-gray-300 text-xs font-semibold">N</span>
                  </div>
                );
              }

              const color = STATUS_COLOR_MAP[dayData.displayCode as keyof typeof STATUS_COLOR_MAP];

              return (
                <div className="flex items-center justify-center">
                  <div
                    title={dayData.displayCode}
                    className="min-w-8 h-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold text-white select-none cursor-default transition-all duration-150 hover:brightness-110"
                    style={{ backgroundColor: color ?? '#94a3b8' }}
                  >
                    {dayData.displayCode}
                  </div>
                </div>
              );
            },
          };
        }),
      };

      base.push(weekCol);
    });

    return base;
  }, [weeks, year, month]);

  return { columns };
};
