import { useMemo } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';

import type { StaffSchedule } from '@/types';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/table/table';

import { ShiftDepartment } from '../components/shift-department';
import { dayNames, getWeeksInMonth } from '../helper';
import { useYearMonth } from './use-year-month';

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
        render: (_, record) => <ShiftDepartment staff={record?.staff} />,
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
              const daySchedule = record?.schedules?.find(
                (schedule) => schedule.date === dateString,
              );

              if (daySchedule && daySchedule.shifts && daySchedule.shifts.length > 0) {
                return (
                  <div className="flex flex-col items-center gap-1.5">
                    {daySchedule.shifts.map((shift, idx) => (
                      <div key={shift.id || idx} className="flex flex-col items-center gap-0.5">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-semibold cursor-pointer transition-transform hover:scale-105',
                          )}
                          title={`Ca làm việc ${idx + 1}`}
                          onClick={() =>
                            onOpen(DrawerType.CHANGE_SHIFT_DIVISION, {
                              record,
                              shift,
                              date: dateString,
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
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }

              return <span className="text-gray-400">--</span>;
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
