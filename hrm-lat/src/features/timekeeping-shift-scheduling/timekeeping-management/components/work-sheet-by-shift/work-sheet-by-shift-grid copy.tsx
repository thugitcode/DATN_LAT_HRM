import { useMemo, useRef, useState } from 'react';

import { StaffPosition } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { StaffInfo } from '@/features/timekeeping-shift-scheduling/components/staff-infor';
import { dayNames, getDaysInMonth } from '@/features/timekeeping-shift-scheduling/helper';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import {
  AttendanceStatus,
  type DayCell,
  type Employee,
  type EmployeeRow,
  type ShiftCode,
  type ShiftRun,
} from '../../types/index.type';
import { GridScheduleRow } from './grid-schedule-row';
import { GridStickyHeaderRow } from './grid-sticky-header-row';

const PILL_SHIFTS = new Set<ShiftCode>([AttendanceStatus.OnTime]);

const CELL_W = 52;

function generateSchedule(seed: number): DayCell[] {
  const patterns: ShiftCode[][] = [
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'VM',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'VM',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
    [
      'M',
      'M',
      'M',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'VM',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'CT',
      'CT',
      'CT',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'VM',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'VM',
      'N',
      'D',
      'WFH',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'VM',
      'N',
      'D',
      'D',
      'D',
      'TG',
      'D',
      'D',
      'N',
    ],
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'QCC',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
    [
      'D',
      'D',
      'D',
      'M',
      'D',
      'D',
      'N',
      'D',
      'D',
      'D',
      'CT',
      'S',
      'S',
      'N',
      'CT',
      'D',
      'D',
      'D',
      'VM',
      'N',
      'D',
      'D',
      'D',
      'D',
      'D',
      'D',
      'N',
    ],
  ];

  const row = patterns[seed % patterns.length];
  return Array.from({ length: 27 }, (_, i) => ({
    day: i + 1,
    weekday: dayNames[i % 7],
    shift: (row[i] ?? 'D') as ShiftCode,
  }));
}

function buildRuns(schedule: DayCell[]): ShiftRun[] {
  const runs: ShiftRun[] = [];
  let i = 0;

  while (i < schedule.length) {
    const shift = schedule[i].shift;

    if (!PILL_SHIFTS.has(shift)) {
      runs.push({ shift, startIndex: i, span: 1 });
      i++;
      continue;
    }

    let j = i + 1;
    while (j < schedule.length && schedule[j].shift === shift) {
      j++;
    }

    runs.push({ shift, startIndex: i, span: j - i });
    i = j;
  }

  return runs;
}

const EMPLOYEES: Employee[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: 'Cấn Văn Đạt',
  role: 'Bác sĩ',
  phone: '123456789',
}));

const ROWS: (EmployeeRow & { runs: ShiftRun[] })[] = EMPLOYEES.map((employee, i) => {
  const schedule = generateSchedule(i);
  return { employee, schedule, runs: buildRuns(schedule) };
});

export const WorkSheetByShiftGrid = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { month, year } = useYearMonth();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  return (
    <div
      ref={scrollRef}
      className="h-[calc(100vh-350px)] overflow-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#D4D4D8' }}
    >
      <div style={{ minWidth: `${208 + days.length * CELL_W}px` }}>
        <GridStickyHeaderRow days={days} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />

        {ROWS.map((row, ri) => (
          <div
            key={row.employee.id}
            className="flex"
            onMouseEnter={() => setHoveredRow(ri)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <div
              className={cn(
                'sticky left-0 z-10 shrink-0 w-52 flex items-center gap-3 px-4 h-16',
                'border-b border-r border-gray-50 transition-colors duration-100',
                hoveredRow === ri ? 'bg-blue-50/60' : 'bg-white',
              )}
            >
              <StaffInfo
                avatarUrl=""
                code="1321"
                departmentName=""
                name={`${row.employee.name}`}
                role={StaffPosition.STAFF}
              />
            </div>

            <GridScheduleRow
              schedule={row.schedule}
              runs={row.runs}
              isHovered={hoveredRow === ri}
              hoveredDay={hoveredDay}
              onRowEnter={() => setHoveredRow(ri)}
              onRowLeave={() => setHoveredRow(null)}
              onDayEnter={(di) => setHoveredDay(di)}
              onDayLeave={() => setHoveredDay(null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkSheetByShiftGrid;
