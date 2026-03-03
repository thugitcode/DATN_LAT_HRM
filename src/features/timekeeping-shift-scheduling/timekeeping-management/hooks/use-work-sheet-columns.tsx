import { useMemo } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import dayjs from 'dayjs';

import type { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/types';
import {
  dayNames,
  getLabelShift,
  getWeeksInMonth,
  isWeekend,
} from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { STAFF_POSITION } from '../../shift-management/constants/data';
import { DepartmentRoomInfo } from '../components/work-sheet-by-shift/department-room-info';
import { STATUS_COLOR_MAP } from '../constants/data';
import type { ShiftCode } from '../types/index.type';
import type { WorkDay, WorkSheetByShiftRow } from '../types/timekeeping-management.type';

const BASE_CELL_CLS =
  'min-w-[60px] h-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold text-white select-none';

// eslint-disable-next-line react-refresh/only-export-components
const DayCell = ({ dayData }: { dayData?: WorkDay }) => {
  const open = useDrawer((state) => state.onOpen);

  const onClick = (workScheduleDetailId: string) => {
    open(DrawerType.TIME_SHEET_DETAIL, workScheduleDetailId);
  };

  if (!dayData) {
    return (
      <div className="flex items-center justify-center">
        <div className={cn(BASE_CELL_CLS, 'bg-gray-300')}>N</div>
      </div>
    );
  }

  const color = STATUS_COLOR_MAP[dayData.displayCode as keyof typeof STATUS_COLOR_MAP];

  return (
    <div className="flex items-center justify-center">
      <div
        title={getLabelShift(dayData.displayCode as ShiftCode)}
        className={cn(
          BASE_CELL_CLS,
          'cursor-default transition-all duration-150 hover:brightness-110',
        )}
        style={{ backgroundColor: color ?? '#94a3b8' }}
        onClick={() => onClick(dayData.workScheduleDetailId)}
      >
        {dayData.displayCode}
      </div>
    </div>
  );
};

const BASE_COLUMNS: Column<WorkSheetByShiftRow>[] = [
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
      <div className="w-50">
        <DepartmentRoomInfo departments={record.departments} rooms={record.rooms} />
      </div>
    ),
  },
  {
    key: 'code',
    title: 'MÃ NHÂN VIÊN',
    render: (_, record) => (
      <div className="text-sm w-32.5 font-mono text-[#11181C]">{record.code}</div>
    ),
  },
  {
    key: 'name',
    title: 'TÊN NHÂN VIÊN',
    fixed: 'left',
    render: (_, record) => (
      <div>
        <p className="text-sm font-medium text-gray-800 w-50">{record.name}</p>
        <p className="text-xs text-[#A1A1AA]">{STAFF_POSITION?.[record.position]}</p>
      </div>
    ),
  },
];

const SUMMERY_COLUMNS: Column<WorkSheetByShiftRow>[] = [
  {
    key: 'summary.totalAttendance',
    title: 'TỔNG CỘNG',
    align: 'center',
    render: (_, record) => (
      <div className="text-sm text-black">{record.summary.totalAttendance}</div>
    ),
  },
  {
    key: 'summary.workDays',
    title: 'NGÀY LÀM',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.summary.workDays}</div>,
  },
  {
    key: 'summary.paidLeave',
    title: 'NGHỈ PHÉP',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.summary.paidLeave}</div>,
  },
  {
    key: 'summary.onCall',
    title: 'CÔNG TRỰC',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.summary.onCall}</div>,
  },
  {
    key: 'summary.actualWorkDays',
    title: 'NGHỈ BÙ TRỰC',
    align: 'center',
    render: (_, record) => (
      <div className="text-sm text-black">{record.summary.actualWorkDays}</div>
    ),
  },
  {
    key: 'summary.holiday',
    title: 'NGHỈ LỄ',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.summary.holiday}</div>,
  },
  {
    key: 'summary.otherLeave',
    title: 'NGHỈ KHÁC',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.summary.otherLeave}</div>,
  },
  {
    key: 'summary.overtimeHours',
    title: 'TĂNG CA',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.summary.overtimeHours}</div>,
  },
  {
    key: 'summary.absentDays',
    title: 'GIỜ BÙ',
    align: 'center',
    render: (_, record) => <div className="text-sm text-black">{record.summary.absentDays}</div>,
  },
];

export const useWorkSheetColumns = () => {
  const { month, year } = useYearMonth();

  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const weekColumns = useMemo<Column<WorkSheetByShiftRow>[]>(
    () =>
      weeks.map((week) => ({
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
          const dateString = dayjs(day.date).format('YYYY-MM-DD');
          const isCN = isWeekend(day.dayOfWeek);

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
            render: (_, record) => <DayCell dayData={record.days[dateString]} />,
          };
        }),
      })),
    [weeks, month],
  );

  const columns = useMemo(
    () => [...BASE_COLUMNS, ...weekColumns, ...SUMMERY_COLUMNS],
    [weekColumns],
  );

  return { columns };
};
