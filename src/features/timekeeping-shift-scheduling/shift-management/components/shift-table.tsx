import React from 'react';

interface ShiftTableProps {
  data: Array<{
    id: number;
    name: string;
    shifts: Record<string, string>;
  }>;
  weeks: Array<{
    weekNumber: number;
    days: Array<{
      day: number;
      dayOfWeek: number;
      date: Date;
    }>;
    startDay: number;
    endDay: number;
  }>;
  month: number;
  dayNames: string[];
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  stickyColumnClassName?: string;
}

export const ShiftTable: React.FC<ShiftTableProps> = ({
  data,
  weeks,
  month,
  dayNames,
  className = '',
  headerClassName = '',
  cellClassName = '',
  stickyColumnClassName = '',
}) => {
  const getShift = (departmentShifts: Record<string, string>, weekNumber: number, day: number) => {
    const shiftKey = `${weekNumber}-${day}`;
    return departmentShifts[shiftKey];
  };

  const getShiftStyle = (shift: string) => {
    switch (shift) {
      case 'S':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'C':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Đ':
        return 'bg-purple-100 text-purple-700 border border-purple-300';
      default:
        return '';
    }
  };

  return (
    <table className={`size-full ${className}`}>
      <thead className={`sticky top-0 z-30 bg-[#F4F4F5] ${headerClassName}`}>
        <tr>
          <th
            rowSpan={2}
            className={`sticky left-0 z-40 px-4 py-3 text-sm font-semibold text-gray-700 w-16 ${stickyColumnClassName}`}
          >
            STT
          </th>
          <th
            rowSpan={2}
            className={`sticky left-16 z-40 px-4 py-3 text-sm font-semibold text-gray-700 w-40 ${stickyColumnClassName}`}
          >
            Khoa/Phòng
          </th>
          {weeks.map((week) => (
            <th
              key={`week-${week.weekNumber}`}
              colSpan={week.days.length}
              className="px-2 py-3 text-sm font-semibold text-gray-700"
            >
              <div className="flex flex-col items-center gap-1">
                <span>Tuần {week.weekNumber}</span>
                <span className="text-xs font-normal text-gray-500">
                  ({week.startDay}/{month + 1} - {week.endDay}/{month + 1})
                </span>
              </div>
            </th>
          ))}
        </tr>

        <tr>
          {weeks.map((week) =>
            week.days.map((day) => (
              <th key={`day-${week.weekNumber}-${day.day}`} className="px-2 py-2 min-w-12.5">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-gray-700">{day.day}</span>
                  <span className="text-xs text-gray-500">{dayNames[day.dayOfWeek]}</span>
                </div>
              </th>
            )),
          )}
        </tr>
      </thead>

      <tbody>
        {data.map((department, index) => (
          <tr key={department.id} className="hover:bg-gray-50 transition-colors">
            {/* STT - Sticky */}
            <td
              className={`sticky left-0 z-20 bg-white border border-gray-300 px-4 py-3 text-center text-sm text-gray-700 ${cellClassName}`}
            >
              {index + 1}
            </td>

            {/* Khoa/Phòng - Sticky */}
            <td
              className={`sticky left-16 z-20 bg-white border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 ${cellClassName}`}
            >
              {department.name}
            </td>

            {/* Các ngày */}
            {weeks.map((week) =>
              week.days.map((day) => {
                const shift = getShift(department.shifts, week.weekNumber, day.day);
                return (
                  <td
                    key={`cell-${department.id}-${week.weekNumber}-${day.day}`}
                    className={`border border-gray-300 px-2 py-3 text-center bg-white ${cellClassName}`}
                  >
                    {shift ? (
                      <span
                        className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold cursor-pointer
                          transition-transform hover:scale-110
                          ${getShiftStyle(shift)}
                        `}
                      >
                        {shift}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">-</span>
                    )}
                  </td>
                );
              }),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
