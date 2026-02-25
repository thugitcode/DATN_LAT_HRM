import { useMemo } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import dayjs from 'dayjs';

import type { StaffSchedule } from '@/types';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/types';

import { dayNames, getWeeksInMonth } from '../../helper';
import { useYearMonth } from '../../hooks/use-year-month';
import { ShiftDepartment } from '../components/shift-department';
import { SHIFT_CA_LEGEND } from '../constants/data';

export const useColumns = () => {
  const { month, year } = useYearMonth();
  const { onOpen } = useDrawer((state) => state);

  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

  const columns: Column<StaffSchedule>[] = useMemo(() => {
    const cols: Column<StaffSchedule>[] = [
      {
        key: 'stt',
        title: 'STT',
        width: 64,
        // fixed: 'left',
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      {
        key: 'doctor-info',
        title: 'KHOA/PHÒNG',
        // width: 286,
        fixed: 'left',
        render: (_, record) => (
          <div className="w-75">
            <ShiftDepartment staff={record?.staff} />
          </div>
        ),
      },
    ];

    weeks.forEach((week, index) => {
      const weekColumn: Column<StaffSchedule> = {
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
        children: week.days.map((day) => {
          return {
            key: `day-${week.weekNumber}-${day.day}`,
            title: (
              <div className="flex flex-col items-center gap-1 text-[14px] text-[#A1A1AA] font-normal">
                <span>{dayNames[day.dayOfWeek]}</span>
                <span>{dayjs(day.date).format('D/M/YY')}</span>
              </div>
            ),
            width: 100,
            align: 'center',
            render: (_, record) => {
              const dateString = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');

              const daySchedule = record?.schedules?.find(
                (schedule) => schedule.date === dateString,
              );

              if (!daySchedule?.shifts?.length) {
                return <span className="text-gray-400">--</span>;
              }

              return (
                <div className="flex flex-col items-center gap-1.5">
                  {daySchedule.shifts.map((shift, idx) => {
                    const color = SHIFT_CA_LEGEND.find(
                      (s) => s.status === shift?.shiftTemplateType,
                    )?.color;

                    return (
                      <div key={shift.id || idx} className="flex flex-col items-center gap-0.5">
                        <span
                          className="inline-flex items-center justify-center px-2 py-1 rounded-md text-sm cursor-pointer transition-transform hover:scale-105"
                          title={`Ca làm việc ${idx + 1}`}
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
  }, [weeks, year, month, onOpen]);

  return {
    columns,
  };
};
