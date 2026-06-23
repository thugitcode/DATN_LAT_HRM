import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/types';
import {
  dayNames,
  getLabelShift,
  getWeeksInMonth,
  isWeekend,
} from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { getStaffPosition } from '../../shift-management/constants/data';
import { DepartmentRoomInfo } from '../components/work-sheet-by-shift/department-room-info';
import { STATUS_COLOR_MAP } from '../constants/data';
import type { ShiftCode } from '../types/index.type';
import type {
  WorkDay,
  WorkSheetByShiftRow,
  WorkSheetByShiftType,
} from '../types/timekeeping-management.type';

const BASE_CELL_CLS =
  'min-w-[60px] h-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold text-white select-none';

// eslint-disable-next-line react-refresh/only-export-components
const DayCell = ({ dayData }: { dayData?: WorkDay }) => {
  const open = useDrawer((state) => state.onOpen);

  if (!dayData) {
    return (
      <div className="min-w-[36px] h-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-400 select-none">
        N
      </div>
    );
  }

  const BADGE_MAP: Record<string, [string, string, string]> = {
    'P':  ['bg-blue-100',   'text-blue-700',   'Đ' ],
    'Đ':  ['bg-blue-100',   'text-blue-700',   'Đ' ],
    'L':  ['bg-orange-100', 'text-orange-700', 'M' ],
    'M':  ['bg-orange-100', 'text-orange-700', 'M' ],
    'EL': ['bg-orange-100', 'text-orange-700', 'S' ],
    'S':  ['bg-orange-100', 'text-orange-700', 'S' ],
    'AB': ['bg-red-100',    'text-red-700',    'VM'],
    'VM': ['bg-red-100',    'text-red-700',    'VM'],
    'LV': ['bg-purple-100', 'text-purple-700', 'P' ],
    'GT': ['bg-blue-200',   'text-blue-800',   'GT'],
  };

  const s = BADGE_MAP[dayData.displayCode] ?? ['bg-gray-100', 'text-gray-400', dayData.displayCode];

  return (
    <div
      title={getLabelShift(dayData.displayCode as ShiftCode)}
      className={cn(
        'min-w-[36px] h-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold select-none',
        'cursor-pointer transition-all duration-150 hover:brightness-110',
        s[0], s[1]
      )}
      onClick={() => open(DrawerType.TIME_SHEET_DETAIL, dayData.workScheduleDetailId)}
    >
      {s[2]}
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const MultiShiftDayCell = ({
  shifts,
  dateString,
  isCN,
}: {
  shifts: WorkSheetByShiftType['shifts'];
  dateString: string;
  isCN: boolean;
}) => {
  if (!shifts.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-1 py-1')}>
        <DayCell />
      </div>
    );
  }

  // Gộp tất cả ca thực tế trong ngày — bỏ ca không có data
  const activeDays = shifts
    .map((se) => se.days[dateString])
    .filter((d) => d && d.displayCode && d.displayCode !== 'N' && d.displayCode !== 'SC');

  return (
    <div className={cn('flex flex-row items-center justify-center gap-1 py-1 flex-wrap')}>
      {activeDays.length === 0
        ? <DayCell />
        : activeDays.map((d, i) => <DayCell key={i} dayData={d} />)
      }
    </div>
  );
};

export const useWorkSheetColumns = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { month, year } = useYearMonth();
  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const staffPosition = useMemo(() => getStaffPosition(t), [t]);

  const baseColumns = useMemo<Column<WorkSheetByShiftType>[]>(
    () => [
      {
        key: 'stt',
        title: t('columns.stt'),
        align: 'center',
        render: (_, __, index) => (index ?? 0) + 1,
      },
      {
        key: 'departmentName',
        title: t('columns.department'),
        render: (_, record) => (
          <div className="w-50">
            <DepartmentRoomInfo departments={record.staff.departments} rooms={record.staff.rooms} />
          </div>
        ),
      },
      {
        key: 'code',
        title: t('columns.employee_code'),
        render: (_, record) => (
          <div className="text-sm w-32.5 font-mono text-[#11181C]">{record.staff.code}</div>
        ),
      },
      {
        key: 'name',
        title: t('columns.employee_name'),
        fixed: 'left',
        render: (_, record) => (
          <div>
            <p className="text-sm font-medium text-gray-800 w-50">{record.staff.name}</p>
            <p className="text-xs text-[#A1A1AA]">{staffPosition?.[record.staff.position]}</p>
          </div>
        ),
      },
    ],
    [staffPosition, t],
  );

  const summaryColumns = useMemo<Column<WorkSheetByShiftRow>[]>(
    () => [
      {
        key: 'summary.totalAttendance',
        title: t('columns.summary.total_attendance'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record?.summary?.totalAttendance}</div>
        ),
      },
      {
        key: 'summary.workDays',
        title: t('columns.summary.work_days'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.actualWorkDays}</div>
        ),
      },
      {
        key: 'summary.paidLeave',
        title: t('columns.summary.paid_leave'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.paidLeave}</div>
        ),
      },
      {
        key: 'summary.onCall',
        title: t('columns.summary.on_call'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.onCall}</div>
        ),
      },
      {
        key: 'summary.actualWorkDays',
        title: t('columns.summary.comp_leave'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.compLeave}</div>
        ),
      },
      {
        key: 'summary.holiday',
        title: t('columns.summary.holiday'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.holiday}</div>
        ),
      },
      {
        key: 'summary.otherLeave',
        title: t('columns.summary.other_leave'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.otherLeave}</div>
        ),
      },
      {
        key: 'summary.overtimeHours',
        title: t('columns.summary.overtime'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.overtimeHours}</div>
        ),
      },
      {
        key: 'summary.absentDays',
        title: t('columns.summary.comp_hours'),
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-black text-center">{record.summary?.compHours}</div>
        ),
      },
    ],
    [t],
  );

  const weekColumns = useMemo<Column<WorkSheetByShiftType>[]>(
    () =>
      weeks.map((week) => ({
        key: `week-${week.weekNumber}`,
        title: (
          <div className="flex items-center justify-center gap-1 text-xs font-semibold uppercase text-nowrap">
            <span>{t('columns.week', { week: week.weekNumber })}:</span>
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
            render: (_, record) => (
              <MultiShiftDayCell shifts={record.shifts} dateString={dateString} isCN={isCN} />
            ),
          };
        }),
      })),
    [weeks, month, t],
  );

  const columns = useMemo(
    () => [...baseColumns, ...weekColumns, ...summaryColumns],
    [baseColumns, weekColumns, summaryColumns],
  );

  return { columns, summaryColumns };
};