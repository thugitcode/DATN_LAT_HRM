import dayjs from 'dayjs';

export function calcStandardWorkingDays(from: Date, to: Date): number {
  let count = 0;
  let cur = dayjs(from);
  const end = dayjs(to);

  while (cur.isBefore(end) || cur.isSame(end, 'day')) {
    const day = cur.day(); // 0 = CN, 6 = T7
    if (day !== 0 && day !== 6) count++;
    cur = cur.add(1, 'day');
  }

  return count;
}

export function getAttendanceCycleDates(month: number, year: number, cycleStartDate: number) {
  const currentMonth = dayjs(new Date(year, month - 1, 1));
  const prevMonth = currentMonth.subtract(1, 'month');

  const fromDay = Math.min(cycleStartDate, prevMonth.daysInMonth());
  const toDay = Math.min(cycleStartDate - 1, currentMonth.daysInMonth());

  const fromDate = prevMonth.date(fromDay).toDate();
  const toDate = currentMonth.date(toDay).toDate();

  return { fromDate, toDate };
}
