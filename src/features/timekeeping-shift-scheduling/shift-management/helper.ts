import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

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
