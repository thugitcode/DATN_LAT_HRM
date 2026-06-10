import i18n from '@/i18n';
import dayjs from 'dayjs';

import type { DailyAttendance, DetailsTimeSheetRecord } from '@/types/shift-details.type';

import type { DayColumn } from './shift-management/types/type';
import { PILL_SHIFTS, WORK_SHEET_LEGEND_ITEMS } from './timekeeping-management/constants/data';
import {
  AttendanceStatus,
  type DayCell,
  type EmployeeRow,
  type FlatRow,
  type IBreakTime,
  type ShiftCode,
  type ShiftRun,
} from './timekeeping-management/types/index.type';
import type {
  WorkSheetByShiftRow,
  WorkSheetByShiftType,
} from './timekeeping-management/types/timekeeping-management.type';

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
  return `${i18n.t(`common:weekdays.${date.day()}`)}, ${i18n.t('common:date_format', { date: date.format('DD/MM/YYYY') })}`;
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
    const item = schedule[i];
    if (!item) {
      i++;
      continue;
    }
    const { shift } = item;

    if (!PILL_SHIFTS.has(shift)) {
      runs.push({
        shift,
        startIndex: i,
        span: 1,
        workScheduleDetailId: item.workScheduleDetailId,
      });
      i++;
      continue;
    }

    let j = i + 1;
    while (j < schedule.length && schedule[j]?.shift === shift) j++;

    runs.push({
      shift,
      startIndex: i,
      span: j - i,
      workScheduleDetailId: schedule.slice(i, j).map((it) => it.workScheduleDetailId ?? ''),
    });

    i = j;
  }

  return runs;
}

// export function groupByStaff(data: WorkSheetByShiftType[]): Map<string, WorkSheetByShiftType> {
//   const map = new Map<string, WorkSheetByShiftType>();

//   for (const item of data) {
//     const existing = map.get(item.staff.id);

//     if (!existing) {
//       map.set(item.staff.id, { ...item, days: { ...item.days } });
//       continue;
//     }

//     for (const [date, incoming] of Object.entries(item.days)) {
//       const current = existing.days[date];

//       existing.days[date] = current
//         ? {
//             ...current,
//             displayCode:
//               current.displayCode === incoming.displayCode
//                 ? current.displayCode
//                 : `${current.displayCode}/${incoming.displayCode}`,
//           }
//         : incoming;
//     }

//     const s = existing.summary;
//     const t = item.summary;
//     existing.summary = {
//       totalWork: s.totalWork + t.totalWork,
//       totalLateMinutes: s.totalLateMinutes + t.totalLateMinutes,
//       totalEarlyMinutes: s.totalEarlyMinutes + t.totalEarlyMinutes,
//       absentDays: s.absentDays + t.absentDays,
//       workDays: s.workDays + t.workDays,
//       actualWorkDays: s.actualWorkDays + t.actualWorkDays,
//       paidLeave: s.paidLeave + t.paidLeave,
//       otherLeave: s.otherLeave + t.otherLeave,
//       onCall: s.onCall + t.onCall,
//       holiday: s.holiday + t.holiday,
//       overtimeHours: s.overtimeHours + t.overtimeHours,
//       totalAttendance: s.totalAttendance + t.totalAttendance,
//     };
//   }

//   return map;
// }

export function groupByStaff(data: WorkSheetByShiftType[]): Map<string, WorkSheetByShiftType> {
  const map = new Map<string, WorkSheetByShiftType>();

  for (const item of data) {
    if (!map.has(item.staff.id)) {
      map.set(item.staff.id, { ...item, days: { ...item.days } });
    }
  }

  return map;
}

export function mapToRow(item: WorkSheetByShiftType, days: ReturnType<typeof getDaysInMonth>) {
  return {
    employee: {
      id: item.staff.id,
      name: item.staff.name,
      role: item.staff.position,
      phone: '',
      code: item.staff.code,
      avatar: item.staff.avatar,
      departments: item.staff.departments,
      rooms: item.staff.rooms,
      departmentName: '',
    },
    shifts: item.shifts.map((shiftEntry) => {
      const schedule: DayCell[] = days.map((d) => ({
        day: d.day,
        weekday: d.dayOfWeek,
        dayOfWeek: d.dayOfWeek,
        shift: (shiftEntry.days[d.date]?.displayCode ?? AttendanceStatus.DayOff) as ShiftCode,
        workScheduleDetailId: shiftEntry.days[d.date]?.workScheduleDetailId ?? '',
      }));

      return {
        shift: shiftEntry.shift,
        schedule,
        runs: buildRuns(schedule),
        summary: shiftEntry.summary,
      };
    }),

    summary: item.summary,
  };
}

export function mapToListRow(item: WorkSheetByShiftType): WorkSheetByShiftRow[] {
  return item.shifts.map((shiftEntry) => ({
    id: item.staff.id,
    code: item.staff.code,
    name: item.staff.name,
    avatar: item.staff.avatar,
    departments: item.staff.departments,
    rooms: item.staff.rooms,
    position: item.staff.position,
    shift: shiftEntry.shift,
    days: shiftEntry.days,
    summary: shiftEntry.summary,
  }));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function fillMissingDaysWithDayjs(
  days: DailyAttendance[],
  startDate: string,
  endDate: string,
): DailyAttendance[] {
  // group records theo date
  const existingMap = new Map<string, DailyAttendance[]>();

  days.forEach((d) => {
    if (!existingMap.has(d.date)) {
      existingMap.set(d.date, []);
    }
    existingMap.get(d.date)!.push(d);
  });

  const result: DailyAttendance[] = [];

  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isSame(end) || current.isBefore(end)) {
    const dateStr = current.format('YYYY-MM-DD');

    const records = existingMap.get(dateStr);

    if (records && records.length) {
      result.push(...records); // push tất cả record của ngày đó
    } else {
      result.push({
        date: dateStr,
        shiftCode: '',
        standardTime: '',
        checkInTime: '',
        checkOutTime: '',
        lateMinutes: 0,
        earlyMinutes: 0,
        workCount: 0,
        totalWorkHours: 0,
        overtimeHours: 0,
        compHours: 0,
      });
    }

    current = current.add(1, 'day');
  }

  return result;
}

export function getLabelShift(shift: ShiftCode): string {
  return WORK_SHEET_LEGEND_ITEMS.find((i) => i.status === shift)?.label ?? shift;
}

export function getTotalDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export const displayTime = (time: string) => {
  return time ? dayjs(time, 'HH:mm:ss').format('HH:mm') : '';
};

export const calculateTotalBreakTime = (breakTimes: IBreakTime[]) => {
  return breakTimes.reduce((total, cur) => {
    const [inHour, inMin] = cur.breakStartTime.split(':').map(Number);
    const [outHour, outMin] = cur.breakEndTime.split(':').map(Number);

    const breakStart = (inHour ?? 0) * 60 + (inMin ?? 0);
    const breakEnd = (outHour ?? 0) * 60 + (outMin ?? 0);

    return total + (breakEnd - breakStart);
  }, 0);
};

export const buildFlatRows = ({
  data,
  expandedGroups,
  fromDate,
  toDate,
}: {
  data?: DetailsTimeSheetRecord[];
  expandedGroups: Set<string>;
  fromDate: string;
  toDate: string;
}): FlatRow[] => {
  const rows: FlatRow[] = [];

  data?.forEach((shift, idx) => {
    const staffIndex = idx + 1;
    const staffCode = shift.staff?.code;
    const isExpanded = expandedGroups.has(staffCode);

    // const allDays = fillMissingDaysWithDayjs(shift.days, fromDate, toDate);
    const allDays = shift.days;

    rows.push({
      type: 'group',
      key: `group-${staffCode}`,
      staff: shift.staff,
      index: staffIndex,
      isExpanded,
    });

    if (isExpanded) {
      allDays.forEach((day, dayIdx) => {
        rows.push({
          type: 'shift',
          key: `shift-${staffCode}-${dayIdx}`,
          staffId: staffCode,
          shift: day,
          isLast: dayIdx === allDays.length - 1,
        });
      });
    }
  });

  return rows;
};

export const getMonthRange = (month: number, year: number) => {
  const start = dayjs()
    .year(year)
    .month(month - 1)
    .startOf('month');
  const end = dayjs()
    .year(year)
    .month(month - 1)
    .endOf('month');

  return { start, end };
};
