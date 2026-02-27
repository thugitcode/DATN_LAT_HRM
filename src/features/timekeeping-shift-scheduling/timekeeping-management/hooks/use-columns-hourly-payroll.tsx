import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/types';

import { dayNames, getWeeksInMonth } from '../../helper';
import { useYearMonth } from '../../hooks/use-year-month';
import type { HourlyPayrollRecord } from '../types/index.type';
import type { AttendanceByHoursResponse } from '../types/timekeeping-management.type';
import { STAFF_POSITION } from '../../shift-management/constants/data';
import type { StaffPosition } from '@/types/global.type';

export const useColumnsHourlyPayroll = () => {
  const { month, year } = useYearMonth();

  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const columns: Column<AttendanceByHoursResponse>[] = useMemo(() => {
    const cols: Column<AttendanceByHoursResponse>[] = [
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
            <span className="font-medium text-[#11181C]">{record.departments?.map(item=>item.name).filter(Boolean).join(", ")}</span>
            <span className="font-normal text-[#52525B]">{record.rooms?.map(item=>item.name).filter(Boolean).join(", ")}</span>
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
        render: (_, record) => <div className="w-32.5">{record?.position ? STAFF_POSITION?.[record.position as StaffPosition] : '-'}</div>,
      },
    ];

    weeks.forEach((week, index) => {
      const weekColumn: Column<AttendanceByHoursResponse> = {
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

              const dayOfMonth = Object.values(record?.days)[day.day - 1];

              if (!dayOfMonth || dayOfMonth.hours === null) {
                return <span className="text-gray-400">--</span>;
              }

              const isLow = dayOfMonth.hours < 8;

              return (
                <span className={cn('font-medium', isLow ? 'text-red-500' : 'text-blue-600')}>
                  {dayOfMonth.hours}h
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
