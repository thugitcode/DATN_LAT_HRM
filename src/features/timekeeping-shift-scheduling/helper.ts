import dayjs from 'dayjs';

import type { DayColumn } from './shift-management/types/type';

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
