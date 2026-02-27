import dayjs from 'dayjs';

import type { DayColumn } from './shift-management/types/type';
import { PILL_SHIFTS } from './timekeeping-management/constants/data';
import type { WorkSheetByShiftRow } from './timekeeping-management/hooks/use-work-sheet-columns';
import {
  AttendanceStatus,
  type DayCell,
  type EmployeeRow,
  type ShiftCode,
  type ShiftRun,
} from './timekeeping-management/types/index.type';
import type { WorkSheetByShiftType } from './timekeeping-management/types/timekeeping-management.type';

export const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const getWeeksInMonth = (year: number, month: number) => {
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let currentWeek = [];
  let weekNumber = 1;
  let weekStartDay = null;

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);

    if (currentWeek.length === 0) {
      weekStartDay = day;
    }

    currentWeek.push({
      day: day,
      dayOfWeek: date.getDay(),
      date: date,
    });

    if (date.getDay() === 0 || day === lastDay.getDate()) {
      weeks.push({
        weekNumber: weekNumber,
        days: [...currentWeek],
        startDay: weekStartDay,
        endDay: day,
      });
      currentWeek = [];
      weekNumber++;
      weekStartDay = null;
    }
  }

  return weeks;
};

export const formatWorkDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = dayjs.utc(dateStr);
  return `${dayNames[date.day()]}, ngày ${date.format('DD/MM/YYYY')}`;
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDaysInMonth = (year: number, month: number): DayColumn[] => {
  const count = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: count }, (_, i) => {
    const dateObj = new Date(year, month, i + 1);

    return {
      day: i + 1,
      dayOfWeek: dateObj.getDay(),
      date: formatDate(dateObj),
    };
  });
};

export const isWeekend = (dow: number) => {
  return dow === 0 || dow === 6;
};

function buildRuns(schedule: DayCell[]): ShiftRun[] {
  const runs: ShiftRun[] = [];
  let i = 0;

  while (i < schedule.length) {
    const { shift } = schedule[i];

    if (!PILL_SHIFTS.has(shift)) {
      runs.push({ shift, startIndex: i, span: 1 });
      i++;
      continue;
    }

    let j = i + 1;
    while (j < schedule.length && schedule[j].shift === shift) j++;

    runs.push({ shift, startIndex: i, span: j - i });
    i = j;
  }

  return runs;
}

export function groupByStaff(data: WorkSheetByShiftType[]): Map<string, WorkSheetByShiftType> {
  const map = new Map<string, WorkSheetByShiftType>();

  for (const item of data) {
    const existing = map.get(item.staff.id);

    if (!existing) {
      map.set(item.staff.id, { ...item, days: { ...item.days } });
      continue;
    }

    for (const [date, incoming] of Object.entries(item.days)) {
      const current = existing.days[date];

      existing.days[date] = current
        ? {
            ...current,
            displayCode:
              current.displayCode === incoming.displayCode
                ? current.displayCode
                : `${current.displayCode}/${incoming.displayCode}`,
          }
        : incoming;
    }

    const s = existing.summary;
    const t = item.summary;
    existing.summary = {
      totalWork: s.totalWork + t.totalWork,
      totalLateMinutes: s.totalLateMinutes + t.totalLateMinutes,
      totalEarlyMinutes: s.totalEarlyMinutes + t.totalEarlyMinutes,
      absentDays: s.absentDays + t.absentDays,
      workDays: s.workDays + t.workDays,
      actualWorkDays: s.actualWorkDays + t.actualWorkDays,
      paidLeave: s.paidLeave + t.paidLeave,
      otherLeave: s.otherLeave + t.otherLeave,
      onCall: s.onCall + t.onCall,
      holiday: s.holiday + t.holiday,
      overtimeHours: s.overtimeHours + t.overtimeHours,
      totalAttendance: s.totalAttendance + t.totalAttendance,
    };
  }

  return map;
}

export function mapToRow(
  item: WorkSheetByShiftType,
  days: ReturnType<typeof getDaysInMonth>,
): EmployeeRow & { runs: ShiftRun[] } {
  const schedule: DayCell[] = days.map((d) => ({
    day: d.day,
    dayOfWeek: d.dayOfWeek,
    shift: (item.days[d.date]?.displayCode ?? AttendanceStatus.DayOff) as ShiftCode,
  }));

  return {
    employee: {
      id: item.staff.id,
      name: item.staff.name,
      role: item.staff.position,
      phone: '',
      code: item.staff.code,
      avatar: item.staff.avatar,
      departmentName: item.staff.departmentName ?? '',
    },
    schedule,
    runs: buildRuns(schedule),
  };
}

export function mapToListRow(item: WorkSheetByShiftType): WorkSheetByShiftRow {
  return {
    id: item.staff.id,
    code: item.staff.code,
    name: item.staff.name,
    avatar: item.staff.avatar,
    departmentName: item.staff.departmentName ?? '',
    position: item.staff.position,
    days: item.days,
    summary: item.summary,
  };
}
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
