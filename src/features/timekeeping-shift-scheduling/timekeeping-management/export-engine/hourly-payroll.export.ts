import dayjs from 'dayjs';

import { getDaysInMonth, getWeeksInMonth } from '../../helper';
import type { AttendanceByHoursResponse } from '../types/timekeeping-management.type';
import { buildSheet, DAY_SHORT, writeWorkbook, type SheetData } from './export.engine';
import { translatePosition } from '@/features/staff-management/time-attendance-management/helpers';

// ─── LIST layout ──────────────────────────────────────────────────────────────

export function exportHourlyPayrollTable(
  data: AttendanceByHoursResponse[],
  year: number,
  month: number,
) {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);

  const FIXED_COLS = [
    { label: 'STT', wch: 6 },
    { label: 'Khoa/phòng', wch: 18, align: 'left' as const },
    { label: 'Mã nhân viên', wch: 16, align: 'left' as const },
    { label: 'Tên nhân viên', wch: 22, align: 'left' as const },
    { label: 'Chức vụ', wch: 14, align: 'left' as const },
  ];

  // Mirrors TOTAL_HOUR_COLUMNS in UI
  const SUMMARY_COLS = [{ label: 'Tổng giờ làm', wch: 14 }];

  const DAY_COLS = allDays.map((d) => ({
    label: `${DAY_SHORT[d.dayOfWeek]}\n${dayjs(new Date(year, month, d.day)).format('D/M/YY')}`,
    wch: 10,
  }));

  const FIXED = FIXED_COLS.length;
  const totalCols = FIXED + allDays.length + SUMMARY_COLS.length;

  // Week row
  const weekRow: unknown[] = Array(FIXED).fill('');
  weeks.forEach((week) => {
    weekRow.push(
      `TUẦN ${week.weekNumber}: ${week.startDay}/${month + 1} - ${week.endDay}/${month + 1}`,
    );
    for (let i = 1; i < week.days.length; i++) weekRow.push('');
  });
  SUMMARY_COLS.forEach((c) => weekRow.push(c.label));

  const weekMerges: import('xlsx-js-style').Range[] = [];
  let weekColStart = FIXED;
  weeks.forEach((week) => {
    if (week.days.length > 1) {
      weekMerges.push({
        s: { r: 1, c: weekColStart },
        e: { r: 1, c: weekColStart + week.days.length - 1 },
      });
    }
    weekColStart += week.days.length;
  });
  weekMerges.push({ s: { r: 1, c: FIXED + allDays.length }, e: { r: 1, c: totalCols - 1 } });

  // Col header
  const colHeaderRow: unknown[] = FIXED_COLS.map((c) => c.label);
  allDays.forEach((d) =>
    colHeaderRow.push(
      `${DAY_SHORT[d.dayOfWeek]}\n${dayjs(new Date(year, month, d.day)).format('D/M/YY')}`,
    ),
  );
  SUMMARY_COLS.forEach((c) => colHeaderRow.push(c.label));

  const rows: SheetData['rows'] = [];
  const staffGroups: SheetData['staffGroups'] = [];
  let currentRow = 3;

  data.forEach((record, idx) => {
    staffGroups.push({ startRow: currentRow, rowCount: 1 });

    const cells: unknown[] = [
      idx + 1,
      record.departments?.map((d) => d.name).join('\n') ?? '',
      record.staffCode ?? '',
      record.staffName ?? '',
      translatePosition(record.position ?? ''),
    ];

    allDays.forEach((day) => {
      const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
      const entry = record.days[dateStr];
      cells.push(entry?.hours != null ? entry.hours : '');
    });

    cells.push(record.totalHours ?? '');

    rows.push({ cells });
    currentRow += 1;
  });

  const sheetData: SheetData = {
    config: {
      title: `BẢNG CÔNG GIỜ THÁNG ${month + 1} NĂM ${year}`,
      fixedCols: FIXED_COLS,
      dayCols: DAY_COLS,
      summaryCols: SUMMARY_COLS,
      headerRowCount: 3,
      leftAlignDataCols: new Set([1, 2, 3, 4]),
    },
    extraHeaderRows: [weekRow, colHeaderRow],
    extraHeaderMerges: weekMerges,
    rows,
    staffGroups,
  };

  const ws = buildSheet(sheetData);
  writeWorkbook(
    ws,
    'Công giờ',
    `cong_gio_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`,
  );
}

// ─── GRID layout ──────────────────────────────────────────────────────────────

export function exportHourlyPayrollGrid(
  data: AttendanceByHoursResponse[],
  year: number,
  month: number,
) {
  const days = getDaysInMonth(year, month);

  const FIXED_COLS = [
    { label: 'STT', wch: 6 },
    { label: 'Mã NV', wch: 14, align: 'left' as const },
    { label: 'Họ và tên', wch: 24, align: 'left' as const },
    { label: 'Khoa/Phòng ban', wch: 30, align: 'left' as const },
    { label: 'Phòng', wch: 20, align: 'left' as const },
    { label: 'Chức vụ', wch: 16, align: 'left' as const },
  ];

  // Mirrors TOTAL_HOUR_COLUMNS in UI
  const SUMMARY_COLS = [{ label: 'Tổng giờ làm', wch: 14 }];

  const DAY_COLS = days.map((d) => ({
    label: `${DAY_SHORT[d.dayOfWeek]}\n${dayjs(d.date).format('D/M/YY')}`,
    wch: 10,
  }));

  const colHeaderRow: unknown[] = FIXED_COLS.map((c) => c.label);
  days.forEach((d) =>
    colHeaderRow.push(`${DAY_SHORT[d.dayOfWeek]}\n${dayjs(d.date).format('D/M/YY')}`),
  );
  SUMMARY_COLS.forEach((c) => colHeaderRow.push(c.label));

  const rows: SheetData['rows'] = [];
  const staffGroups: SheetData['staffGroups'] = [];
  let currentRow = 2;

  data.forEach((record, idx) => {
    staffGroups.push({ startRow: currentRow, rowCount: 1 });

    const cells: unknown[] = [
      idx + 1,
      record.staffCode ?? '',
      record.staffName ?? '',
      record.departments?.map((d) => d.name).join('\n') ?? '',
      record.rooms?.map((r) => r.name).join('\n') ?? '',
      translatePosition(record.position ?? ''),
    ];

    days.forEach((d) => {
      const entry = record.days[d.date];
      cells.push(entry?.hours != null ? entry.hours : '');
    });

    cells.push(record.totalHours ?? '');

    rows.push({ cells });
    currentRow += 1;
  });

  const sheetData: SheetData = {
    config: {
      title: `BẢNG CÔNG GIỜ THÁNG ${month + 1} NĂM ${year}`,
      fixedCols: FIXED_COLS,
      dayCols: DAY_COLS,
      summaryCols: SUMMARY_COLS,
      headerRowCount: 2,
      leftAlignDataCols: new Set([1, 2, 3, 4, 5]),
    },
    extraHeaderRows: [colHeaderRow],
    extraHeaderMerges: [],
    rows,
    staffGroups,
  };

  const ws = buildSheet(sheetData);
  writeWorkbook(
    ws,
    'Công giờ',
    `cong_gio_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`,
  );
}
