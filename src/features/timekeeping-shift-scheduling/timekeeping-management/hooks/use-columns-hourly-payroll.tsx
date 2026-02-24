import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/table';

import { dayNames, getWeeksInMonth } from '../../helper';
import { useYearMonth } from '../../hooks/use-year-month';
import type { HourlyPayrollRecord } from '../types/index.type';

export const useColumnsHourlyPayroll = () => {
  const { month, year } = useYearMonth();

  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const columns: Column<HourlyPayrollRecord>[] = useMemo(() => {
    const cols: Column<HourlyPayrollRecord>[] = [
      {
        key: 'stt',
        title: 'STT',
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      {
        key: 'department',
        title: 'KHOA/PHÒNG',
        render: (_, record) => (
          <div className="flex flex-col w-75 text-[14px]">
            <span className="font-medium text-[#11181C]">{record.department}</span>
            <span className="font-normal text-[#52525B]">{record.room}</span>
          </div>
        ),
      },
      {
        key: 'staffCode',
        title: 'MÃ NHÂN VIÊN',
        width: 120,
        align: 'center',
        dataIndex: 'staffCode',
        render: (_, record) => <div className="w-32.5">{record?.staffCode}</div>,
      },
      {
        key: 'staffName',
        title: 'TÊN NHÂN VIÊN',
        width: 200,
        dataIndex: 'staffName',
        fixed: 'left',
        render: (_, record) => <div className="text-nowrap">{record?.staffName}</div>,
      },
      {
        key: 'position',
        title: 'CHỨC VỤ',
        width: 100,
        align: 'center',
        dataIndex: 'position',
        render: (_, record) => <div className="w-32.5">{record?.position}</div>,
      },
    ];

    weeks.forEach((week, index) => {
      const weekColumn: Column<HourlyPayrollRecord> = {
        key: `week-${week.weekNumber}`,
        title: (
          <div
            className={cn(
              'flex items-center justify-center gap-1 font-semibold! text-xs uppercase! text-nowrap',
              !!index,
            )}
          >
            <span>TUẦN {week.weekNumber}:</span>
            <span>
              ({week.startDay}/{month + 1} - {week.endDay}/{month + 1})
            </span>
          </div>
        ),
        children: week.days.map((day, dayIndex) => {
          const dateObj = new Date(year, month, day.day);
          const dateString = dateObj.toISOString().split('T')[0];

          return {
            key: `day-${week.weekNumber}-${day.day}`,
            title: (
              <div className="flex flex-col items-center gap-1 text-[14px] text-[#A1A1AA] font-normal">
                <span>{dayNames[day.dayOfWeek]}</span>
                <span>
                  {day.day}/{month + 1}/{year}
                </span>
              </div>
            ),
            width: 100,
            align: 'center',
            className: '',
            render: (_, record) => {
              const day = record?.weeks?.[0]?.days[dayIndex];

              if (!day || day.hours === null) {
                return <span className="text-gray-400">--</span>;
              }

              const isLow = day.hours < 8;

              return (
                <span className={cn('font-medium', isLow ? 'text-red-500' : 'text-blue-600')}>
                  {day.hours}h
                </span>
              );
            },
          };
        }),
      };
      cols.push(weekColumn);
    });

    return cols;
  }, [month, weeks, year]);

  return { columns };
};
