import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/types';

import { dayNames, getWeeksInMonth, isWeekend } from '../../helper';
import { useYearMonth } from '../../hooks/use-year-month';
import { getStaffPosition } from '../../shift-management/constants/data';
import { DepartmentRoomInfo } from '../components/work-sheet-by-shift/department-room-info';
import { getHourlyPayrollLegendItems, HoursStatusEnum } from '../constants/data';
import type { AttendanceByHoursResponse } from '../types/timekeeping-management.type';

// eslint-disable-next-line react-refresh/only-export-components
const HoursCell = ({
  hours,
  status,
  legendItems,
}: {
  hours: number | null | undefined;
  status?: HoursStatusEnum;
  legendItems: ReturnType<typeof getHourlyPayrollLegendItems>;
}) => {
  const color = legendItems?.find((h) => h.status === status)?.color;

  if (hours == null || status === HoursStatusEnum.OFF) {
    return <span style={{ color }}>--</span>;
  }

  return (
    <span className={cn('font-medium')} style={{ color }}>
      {hours}h
    </span>
  );
};

export const useColumnsHourlyPayroll = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { month, year } = useYearMonth();
  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const legendItems = useMemo(() => getHourlyPayrollLegendItems(t), [t]);
  const staffPosition = useMemo(() => getStaffPosition(t), [t]);

  const baseColumns = useMemo<Column<AttendanceByHoursResponse>[]>(
    () => [
      {
        key: 'stt',
        title: t('columns.stt'),
        align: 'center',
        render: (_, __, index) => (index ?? 0) + 1,
      },
      {
        key: 'department',
        title: t('columns.department'),
        render: (_, record) => (
          <div className="w-50">
            <DepartmentRoomInfo departments={record.departments} rooms={record.rooms} />
          </div>
        ),
      },
      {
        key: 'staffCode',
        title: t('columns.employee_code'),
        width: 120,
        align: 'center',
        render: (_, record) => <div className="w-32.5 text-left">{record?.staffCode}</div>,
      },
      {
        key: 'staffName',
        title: t('columns.employee_name'),
        width: 200,
        fixed: 'left',
        render: (_, record) => <div className="text-nowrap">{record?.staffName}</div>,
      },
      {
        key: 'position',
        title: t('columns.position'),
        width: 100,
        align: 'center',
        render: (_, record) => (
          <div className="w-32.5">
            {record?.position ? staffPosition?.[record.position as StaffPosition] : '-'}
          </div>
        ),
      },
    ],
    [staffPosition, t],
  );

  const totalHourColumns = useMemo<Column<AttendanceByHoursResponse>[]>(
    () => [
      {
        key: 'totalHours',
        title: t('columns.summary.total_hours'),
        align: 'center',
        render: (_, record) => <div className="text-sm text-black">{record.totalHours}</div>,
      },
    ],
    [t],
  );

  const weekColumns = useMemo<Column<AttendanceByHoursResponse>[]>(
    () =>
      weeks.map((week) => ({
        key: `week-${week.weekNumber}`,
        title: (
          <div className="flex items-center justify-center gap-1 font-semibold text-xs uppercase text-nowrap">
            <span>{t('columns.week', { week: week.weekNumber })}:</span>
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
              return (
                <HoursCell
                  hours={dayData?.hours}
                  status={dayData?.status}
                  legendItems={legendItems}
                />
              );
            },
          };
        }),
      })),
    [weeks, month, t, legendItems],
  );

  const columns = useMemo(
    () => [...baseColumns, ...weekColumns, ...totalHourColumns],
    [baseColumns, weekColumns, totalHourColumns],
  );

  return { columns, totalHourColumns };
};
