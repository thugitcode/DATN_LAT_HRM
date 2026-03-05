import { useMemo } from 'react';
import dayjs from 'dayjs';

import type { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/types';

import { dayNames, getWeeksInMonth, isWeekend } from '../../helper';
import { useYearMonth } from '../../hooks/use-year-month';
import { STAFF_POSITION } from '../../shift-management/constants/data';
import { DepartmentRoomInfo } from '../components/work-sheet-by-shift/department-room-info';
import { HOURLY_PAYROLL_LEGEND_ITEMS, HoursStatusEnum } from '../constants/data';
import type { AttendanceByHoursResponse } from '../types/timekeeping-management.type';

// eslint-disable-next-line react-refresh/only-export-components
const HoursCell = ({
  hours,
  status,
}: {
  hours: number | null | undefined;
  status?: HoursStatusEnum;
}) => {
  const color = HOURLY_PAYROLL_LEGEND_ITEMS?.find((h) => h.status === status)?.color;

  if (hours == null || status === HoursStatusEnum.OFF) {
    return (
      <span
        style={{
          color,
        }}
      >
        --
      </span>
    );
  }

  return (
    <span
      className={cn('font-medium')}
      style={{
        color,
      }}
    >
      {hours}h
    </span>
  );
};

const BASE_COLUMNS: Column<AttendanceByHoursResponse>[] = [
  {
    key: 'stt',
    title: 'STT',
    align: 'center',
    render: (_, __, index) => (index ?? 0) + 1,
  },
  {
    key: 'department',
    title: 'KHOA/PHÒNG',
    render: (_, record) => (
      <div className="w-50">
        <DepartmentRoomInfo departments={record.departments} rooms={record.rooms} />
      </div>
    ),
  },
  {
    key: 'staffCode',
    title: 'MÃ NHÂN VIÊN',
    width: 120,
    align: 'center',
    render: (_, record) => <div className="w-32.5">{record?.staffCode}</div>,
  },
  {
    key: 'staffName',
    title: 'TÊN NHÂN VIÊN',
    width: 200,
    fixed: 'left',
    render: (_, record) => <div className="text-nowrap">{record?.staffName}</div>,
  },
  {
    key: 'position',
    title: 'CHỨC VỤ',
    width: 100,
    align: 'center',
    render: (_, record) => (
      <div className="w-32.5">
        {record?.position ? STAFF_POSITION?.[record.position as StaffPosition] : '-'}
      </div>
    ),
  },
];

export const TOTAL_HOUR_COLUMNS: Column<AttendanceByHoursResponse>[] = [
  {
    key: 'totalHours',
    title: 'TỔNG GỜ LÀM',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.totalHours}</div>,
  },
];

export const useColumnsHourlyPayroll = () => {
  const { month, year } = useYearMonth();
  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const weekColumns = useMemo<Column<AttendanceByHoursResponse>[]>(
    () =>
      weeks.map((week) => ({
        key: `week-${week.weekNumber}`,
        title: (
          <div className="flex items-center justify-center gap-1 font-semibold text-xs uppercase text-nowrap">
            <span>TUẦN {week.weekNumber}:</span>
            <span>
              ({week.startDay}/{month + 1} - {week.endDay}/{month + 1})
            </span>
          </div>
        ),
        children: week.days.map((day) => {
          const dateString = dayjs(day.date).format('YYYY-MM-DD');
          const isCN = isWeekend(day.dayOfWeek);

          return {
            key: `day-${week.weekNumber}-${day.day}`,
            title: (
              <div
                className={cn(
                  'flex flex-col items-center gap-1 text-[14px] font-normal',
                  isCN ? 'text-red-400' : 'text-[#A1A1AA]',
                )}
              >
                <span>{dayNames[day.dayOfWeek]}</span>
                <span>{dayjs(day.date).format('D/M/YYYY')}</span>
              </div>
            ),
            width: 100,
            align: 'center' as const,
            render: (_, record) => {
              const dayData = record?.days?.[dateString];

              return <HoursCell hours={dayData?.hours} status={dayData?.status} />;
            },
          };
        }),
      })),
    [weeks, month],
  );

  const columns = useMemo(
    () => [...BASE_COLUMNS, ...weekColumns, ...TOTAL_HOUR_COLUMNS],
    [weekColumns],
  );

  return { columns };
};
