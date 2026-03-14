import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { StaffSchedule } from '@/types';
import type { Column } from '@/components/table/types';

import { StaffInfo } from '../../components/staff-infor';
import { dayNames, getWeeksInMonth } from '../../helper';
import { useYearMonth } from '../../hooks/use-year-month';
import { getShiftCaLegend } from '../constants/data'; // ✅

interface UseColumnsProps {
  data?: StaffSchedule[];
}

const H_SHIFT = 58;

export const useColumns = ({ data = [] }: UseColumnsProps = {}) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { month, year } = useYearMonth();
  const { onOpen } = useDrawer((state) => state);

  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);
  const shiftCaLegend = useMemo(() => getShiftCaLegend(t), [t]); // ✅

  const maxShiftsPerRow = useMemo(() => {
    const map: Record<string, number> = {};

    data.forEach((record) => {
      const staffId = record.staff.id;
      let max = 0;

      record?.schedules?.forEach((schedule) => {
        const scheduleDate = dayjs(schedule.date);
        if (scheduleDate.month() !== month || scheduleDate.year() !== year) return;

        const count = schedule.shifts?.length ?? 0;
        if (count > max) max = count;
      });

      map[staffId] = max;
    });

    return map;
  }, [data, month, year]);

  const columns: Column<StaffSchedule>[] = useMemo(() => {
    const cols: Column<StaffSchedule>[] = [
      {
        key: 'stt',
        title: t('columns.stt'),
        width: 64,
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      {
        key: 'doctor-info',
        title: t('columns.department'),
        fixed: 'left',
        render: (_, record) => (
          <div className="w-75">
            <StaffInfo
              avatarUrl={record?.staff?.avatar}
              code={record?.staff?.code}
              rooms={record?.staff?.rooms}
              departments={record?.staff?.departments}
              name={record?.staff?.name}
              role={record?.staff?.position}
            />
          </div>
        ),
      },
    ];

    weeks.forEach((week) => {
      const weekColumn: Column<StaffSchedule> = {
        key: `week-${week.weekNumber}`,
        title: (
          <div className="flex items-center justify-center gap-1 font-semibold text-xs uppercase text-nowrap">
            <span>
              {t('columns.week', { week: week.weekNumber })}: {week.startDay}/{month + 1} -{' '}
              {week.endDay}/{month + 1}
            </span>
          </div>
        ),
        children: week.days.map((day) => ({
          key: `day-${week.weekNumber}-${day.day}`,
          title: (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-medium text-[#A1A1AA]">{dayNames[day.dayOfWeek]}</span>
              <span className="text-xs font-normal text-[#A1A1AA]">
                {dayjs(day.date).format('D/M/YY')}
              </span>
            </div>
          ),
          width: 100,
          align: 'center',
          render: (_, record) => {
            const dateString = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
            const daySchedule = record?.schedules?.find((s) => s.date === dateString);
            const maxShifts = maxShiftsPerRow[record.staff.id] ?? 0;

            if (!daySchedule?.shifts?.length) {
              return (
                <div className="flex flex-col items-center gap-1.5 h-full">
                  {Array.from({ length: maxShifts }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-0.5 justify-center"
                      style={{ height: H_SHIFT }}
                    >
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-sm h-7">
                        --
                      </span>
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div className="flex flex-col items-start gap-1.5 h-full!">
                {Array.from({ length: maxShifts }).map((_, idx) => {
                  const shift = daySchedule.shifts[idx];

                  if (!shift) {
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-center gap-0.5 w-full"
                        style={{ height: H_SHIFT }}
                      >
                        <span className="inline-flex items-center justify-center px-2 py-1 text-sm text-gray-400">
                          --
                        </span>
                      </div>
                    );
                  }

                  const color = shiftCaLegend.find(
                    // ✅
                    (s) => s.status === shift?.shiftTemplateType,
                  )?.color;

                  return (
                    <div
                      key={shift.id || idx}
                      className="flex flex-col items-center gap-0.5 h-full"
                      style={{ height: H_SHIFT }}
                    >
                      <span
                        className="max-w-25 truncate px-2 py-1 rounded-md text-sm cursor-pointer transition-transform hover:scale-105"
                        title={shift.shiftTemplateName}
                        style={{ color }}
                        onClick={() =>
                          onOpen(DrawerType.CHANGE_SHIFT_DIVISION, {
                            record,
                            shift,
                            date: dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD'),
                            day: day.day,
                            month: month + 1,
                            year,
                            dayOfWeek: day.dayOfWeek,
                          })
                        }
                      >
                        {shift.shiftTemplateName}
                      </span>
                      <span className="text-[14px] text-black whitespace-nowrap bg-[#D4D4D866] rounded-md py-1 px-2.5">
                        {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          },
        })),
      };
      cols.push(weekColumn);
    });

    return cols;
  }, [weeks, month, year, maxShiftsPerRow, onOpen, t, shiftCaLegend]);

  return { columns };
};
