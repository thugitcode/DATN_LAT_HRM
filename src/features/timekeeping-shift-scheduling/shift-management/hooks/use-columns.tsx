import { useMemo } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { IconLine } from '@tabler/icons-react';
import dayjs from 'dayjs';

import type { StaffSchedule } from '@/types';
import type { Column } from '@/components/table/types';

import { StaffInfo } from '../../components/staff-infor';
import { dayNames, getWeeksInMonth } from '../../helper';
import { useYearMonth } from '../../hooks/use-year-month';
import { SHIFT_CA_LEGEND } from '../constants/data';

interface UseColumnsProps {
  data?: StaffSchedule[];
}

const H_SHIFT = 78;

export const useColumns = ({ data = [] }: UseColumnsProps = {}) => {
  const { month, year } = useYearMonth();
  const { onOpen } = useDrawer((state) => state);

  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const maxShiftsPerDate = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    data.forEach((record) => {
      const staffId = record.staff.id;
      record?.schedules?.forEach((schedule) => {
        if (!map[schedule.date]) map[schedule.date] = {};
        map[schedule.date][staffId] = schedule.shifts?.length ?? 0;
      });
    });
    return map;
  }, [data]);

  const columns: Column<StaffSchedule>[] = useMemo(() => {
    const cols: Column<StaffSchedule>[] = [
      {
        key: 'stt',
        title: 'STT',
        width: 64,
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      {
        key: 'doctor-info',
        title: 'KHOA/PHÒNG',
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
              TUẦN {week.weekNumber}: {week.startDay}/{month + 1} - {week.endDay}/{month + 1}
            </span>
          </div>
        ),
        children: week.days.map((day) => {
          return {
            key: `day-${week.weekNumber}-${day.day}`,
            title: (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-medium text-[#A1A1AA]">
                  {dayNames[day.dayOfWeek]}
                </span>
                <span className="text-xs font-normal text-[#A1A1AA]">
                  {dayjs(day.date).format('D/M/YY')}
                </span>
              </div>
            ),
            width: 100,
            align: 'center',
            render: (_, record) => {
              const dateString = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');

              const daySchedule = record?.schedules?.find(
                (schedule) => schedule.date === dateString,
              );

              const maxShifts = maxShiftsPerDate[dateString]?.[record.staff.id] ?? 0;

              if (!daySchedule?.shifts?.length) {
                return (
                  <div className="flex flex-col items-center gap-1.5 h-full">
                    {Array.from({ length: maxShifts }).map((_, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-0.5">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-sm h-7">
                          --
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div className="flex flex-col items-center gap-1.5">
                  {Array.from({ length: maxShifts }).map((_, idx) => {
                    const shift = daySchedule.shifts[idx];

                    if (!shift) {
                      return (
                        <div key={idx} className="flex flex-col items-center gap-0.5">
                          <span className="inline-flex items-center justify-center px-2 py-1 text-sm text-gray-400">
                            --
                          </span>
                        </div>
                      );
                    }

                    const color = SHIFT_CA_LEGEND.find(
                      (s) => s.status === shift?.shiftTemplateType,
                    )?.color;

                    return (
                      <div key={shift.id || idx} className="flex flex-col items-center gap-0.5 ">
                        <span
                          className="max-w-[100px] truncate px-2 py-1 rounded-md text-sm cursor-pointer transition-transform hover:scale-105"
                          title={shift.shiftTemplateName}
                          style={{ color }}
                          onClick={() =>
                            onOpen(DrawerType.CHANGE_SHIFT_DIVISION, {
                              record,
                              shift,
                              date: day.date,
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
          };
        }),
      };
      cols.push(weekColumn);
    });

    return cols;
  }, [weeks, year, month, onOpen, maxShiftsPerDate]);

  return {
    columns,
  };
};
