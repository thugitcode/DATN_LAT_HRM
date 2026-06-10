import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import { getDaysInMonth, getWeeksInMonth } from '@/features/timekeeping-shift-scheduling/helper';
import { STAFF_POSITION } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';

import type { WorkSheetByShiftType } from '../types/timekeeping-management.type';
import {
  buildSheet,
  DAY_SHORT,
  formatDate,
  formatDateLabel,
  writeWorkbook,
  type SheetData,
} from './export.engine';

// ─── Summary columns config ───────────────────────────────────────────────────

const SUMMARY_COLS = [
  { key: 'totalAttendance', label: 'Tổng công', wch: 11 },
  { key: 'actualWorkDays', label: 'Ngày làm', wch: 10 },
  { key: 'paidLeave', label: 'Nghỉ phép', wch: 11 },
  { key: 'onCall', label: 'Công trực', wch: 11 },
  { key: 'compLeave', label: 'Nghỉ bù trực', wch: 12 },
  { key: 'holiday', label: 'Nghỉ lễ', wch: 10 },
  { key: 'otherLeave', label: 'Nghỉ khác', wch: 11 },
  { key: 'overtimeHours', label: 'Tăng ca', wch: 10 },
  { key: 'compHours', label: 'Giờ bù', wch: 10 },
] as const;

type SummaryKey = (typeof SUMMARY_COLS)[number]['key'];

function aggregateSummary(shifts: WorkSheetByShiftType['shifts']): Record<SummaryKey, number> {
  return shifts.reduce(
    (acc, s) => {
      SUMMARY_COLS.forEach(({ key }) => {
        acc[key] = (acc[key] ?? 0) + ((s.summary[key] as number) ?? 0);
      });
      return acc;
    },
    {} as Record<SummaryKey, number>,
  );
}

function shiftLabel(shift: WorkSheetByShiftType['shifts'][number]['shift']) {
  return `${shift.name}\n${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}`;
}

// ─── LIST layout (grouped by weeks) ──────────────────────────────────────────

export function exportWorkSheetByShiftTable(
  data: WorkSheetByShiftType[],
  year: number,
  month: number,
  departmentName: string = '',
) {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);

  const FIXED_COLS = [
    { label: 'STT', wch: 6 },
    { label: 'Khoa/phòng', wch: 18, align: 'left' as const },
    { label: 'Mã nhân viên', wch: 16, align: 'left' as const },
    { label: 'Tên nhân viên', wch: 22, align: 'left' as const },
    { label: 'Chức vụ', wch: 14, align: 'left' as const },
    { label: 'Ca làm việc', wch: 20 },
  ];

  const DAY_COLS = allDays.map((d) => ({
    label: `${DAY_SHORT[d.dayOfWeek]}\n${formatDateLabel(year, month, d.day)}`,
    wch: 10,
  }));

  const FIXED = FIXED_COLS.length;
  const totalDayCols = allDays.length;
  // totalCols does NOT include the 2 company rows — just structural cols
  const totalCols = FIXED + totalDayCols + SUMMARY_COLS.length;

  // ── Week row (row index 2 in sheet, index 0 in extraHeaderRows) ───────────
  // Note: rows 0-1 are the company rows added by buildSheet automatically.
  // extraHeaderRows start at row 2.
  const weekRow: unknown[] = Array(FIXED).fill('');
  weeks.forEach((week) => {
    weekRow.push(
      `TUẦN ${week.weekNumber}: ${week.startDay}/${month + 1} - ${week.endDay}/${month + 1}`,
    );
    for (let i = 1; i < week.days.length; i++) weekRow.push('');
  });
  SUMMARY_COLS.forEach((c) => weekRow.push(c.label));

  // ── Col header row (row index 3 in sheet, index 1 in extraHeaderRows) ─────
  const colHeaderRow: unknown[] = FIXED_COLS.map((c) => c.label);
  allDays.forEach((d) =>
    colHeaderRow.push(`${DAY_SHORT[d.dayOfWeek]}\n${formatDateLabel(year, month, d.day)}`),
  );
  SUMMARY_COLS.forEach((c) => colHeaderRow.push(c.label));

  // ── Merges for week row (offset +2 because buildSheet prepends 2 company rows)
  const weekMerges: XLSX.Range[] = [];
  const ROW_OFFSET = 2; // 2 company rows prepended by buildSheet

  let weekColStart = FIXED;
  weeks.forEach((week) => {
    if (week.days.length > 1) {
      weekMerges.push({
        s: { r: ROW_OFFSET + 0, c: weekColStart },
        e: { r: ROW_OFFSET + 0, c: weekColStart + week.days.length - 1 },
      });
    }
    weekColStart += week.days.length;
  });
  // Merge summary header in week row
  weekMerges.push({
    s: { r: ROW_OFFSET + 0, c: FIXED + totalDayCols },
    e: { r: ROW_OFFSET + 0, c: totalCols - 1 },
  });

  // ── Data rows ─────────────────────────────────────────────────────────────
  const rows: SheetData['rows'] = [];
  const staffGroups: SheetData['staffGroups'] = [];
  // data starts at row: 2 (company) + 2 (extraHeaderRows) = 4
  let currentRow = ROW_OFFSET + 2;

  data.forEach((record, idx) => {
    const { staff, shifts } = record;
    const numShifts = Math.max(shifts.length, 1);
    const mergeRanges: XLSX.Range[] = [];

    staffGroups.push({ startRow: currentRow, rowCount: numShifts });

    // Merge fixed cols (except Ca col=5) + summary cols vertically
    if (numShifts > 1) {
      for (let c = 0; c < 5; c++) {
        mergeRanges.push({ s: { r: currentRow, c }, e: { r: currentRow + numShifts - 1, c } });
      }
      for (let c = FIXED + totalDayCols; c < totalCols; c++) {
        mergeRanges.push({ s: { r: currentRow, c }, e: { r: currentRow + numShifts - 1, c } });
      }
    }

    const totalSummary = aggregateSummary(shifts);

    shifts.forEach((shiftEntry, shiftIdx) => {
      const isFirst = shiftIdx === 0;
      const cells: unknown[] = isFirst
        ? [
            idx + 1,
            staff.departments?.map((d) => d.name).join('\n') ?? '',
            staff.code ?? '',
            staff.name ?? '',
            STAFF_POSITION[staff.position] ?? '',
            shiftLabel(shiftEntry.shift),
          ]
        : ['', '', '', '', '', shiftLabel(shiftEntry.shift)];

      allDays.forEach((day) => {
        const dateStr = formatDate(year, month, day.day);
        const workDay = shiftEntry.days[dateStr];
        cells.push(workDay?.displayCode ?? '');
      });

      if (isFirst) {
        SUMMARY_COLS.forEach(({ key }) => cells.push(totalSummary[key] ?? ''));
      }

      rows.push({ cells, isContinuation: !isFirst });
      currentRow += 1;
    });

    mergeRanges.forEach((m) => weekMerges.push(m));
  });

  const sheetData: SheetData = {
    config: {
      title: `BẢNG CHẤM CÔNG THEO CA THÁNG ${month + 1} NĂM ${year}`,
      companyName1: 'TÊN CÔNG TY / ĐƠN VỊ',
      companyName2: '',
      departmentName,
      fixedCols: FIXED_COLS,
      dayCols: DAY_COLS,
      summaryCols: SUMMARY_COLS.map((c) => ({ label: c.label, wch: c.wch })),
      // 2 company rows + 1 week row + 1 col header row = 4
      headerRowCount: 4,
      leftAlignDataCols: new Set([1, 2, 3, 4]),
      year,
    },
    extraHeaderRows: [weekRow, colHeaderRow],
    extraHeaderMerges: weekMerges,
    rows,
    staffGroups,
  };

  const ws = buildSheet(sheetData);
  writeWorkbook(
    ws,
    'Chấm công theo ca',
    `cham_cong_theo_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`,
  );
}

// ─── GRID layout (full month) ─────────────────────────────────────────────────

export function exportWorkSheetByShiftGrid(
  data: WorkSheetByShiftType[],
  year: number,
  month: number,
  departmentName: string = '',
) {
  const days = getDaysInMonth(year, month);

  const FIXED_COLS = [
    { label: 'STT', wch: 6 },
    { label: 'Mã NV', wch: 14, align: 'left' as const },
    { label: 'Họ và tên', wch: 24, align: 'left' as const },
    { label: 'Khoa/Phòng ban', wch: 30, align: 'left' as const },
    { label: 'Phòng', wch: 20, align: 'left' as const },
    { label: 'Chức vụ', wch: 16, align: 'left' as const },
    { label: 'Ca làm việc', wch: 20 },
  ];

  const DAY_COLS = days.map((d) => ({
    label: `${DAY_SHORT[d.dayOfWeek]}\n${dayjs(d.date).format('D/M/YY')}`,
    wch: 10,
  }));

  const FIXED = FIXED_COLS.length;
  const totalCols = FIXED + days.length + SUMMARY_COLS.length;
  const ROW_OFFSET = 2; // 2 company rows prepended by buildSheet

  // ── Col header row only (no week row for grid) ─────────────────────────────
  const colHeaderRow: unknown[] = FIXED_COLS.map((c) => c.label);
  days.forEach((d) =>
    colHeaderRow.push(`${DAY_SHORT[d.dayOfWeek]}\n${dayjs(d.date).format('D/M/YY')}`),
  );
  SUMMARY_COLS.forEach((c) => colHeaderRow.push(c.label));

  const extraMerges: XLSX.Range[] = [];
  const rows: SheetData['rows'] = [];
  const staffGroups: SheetData['staffGroups'] = [];
  // data starts at row: 2 (company) + 1 (colHeader) = 3
  let currentRow = ROW_OFFSET + 1;

  data.forEach((record, idx) => {
    const { staff, shifts } = record;
    const numShifts = Math.max(shifts.length, 1);

    staffGroups.push({ startRow: currentRow, rowCount: numShifts });

    if (numShifts > 1) {
      for (let c = 0; c < 6; c++) {
        extraMerges.push({ s: { r: currentRow, c }, e: { r: currentRow + numShifts - 1, c } });
      }
      for (let c = FIXED + days.length; c < totalCols; c++) {
        extraMerges.push({ s: { r: currentRow, c }, e: { r: currentRow + numShifts - 1, c } });
      }
    }

    const totalSummary = aggregateSummary(shifts);

    shifts.forEach((shiftEntry, shiftIdx) => {
      const isFirst = shiftIdx === 0;
      const cells: unknown[] = isFirst
        ? [
            idx + 1,
            staff.code ?? '',
            staff.name ?? '',
            staff.departments?.map((d) => d.name).join('\n') ?? '',
            staff.rooms?.map((r) => r.name).join('\n') ?? '',
            STAFF_POSITION[staff.position] ?? '',
            shiftLabel(shiftEntry.shift),
          ]
        : ['', '', '', '', '', '', shiftLabel(shiftEntry.shift)];

      days.forEach((d) => {
        const workDay = shiftEntry.days[d.date];
        cells.push(workDay?.displayCode ?? '');
      });

      if (isFirst) {
        SUMMARY_COLS.forEach(({ key }) => cells.push(totalSummary[key] ?? ''));
      }

      rows.push({ cells, isContinuation: !isFirst });
      currentRow += 1;
    });
  });

  const sheetData: SheetData = {
    config: {
      title: `BẢNG CHẤM CÔNG THEO CA THÁNG ${month + 1} NĂM ${year}`,
      companyName1: 'TÊN CÔNG TY / ĐƠN VỊ',
      companyName2: '',
      departmentName,
      fixedCols: FIXED_COLS,
      dayCols: DAY_COLS,
      summaryCols: SUMMARY_COLS.map((c) => ({ label: c.label, wch: c.wch })),
      // 2 company rows + 1 col header row = 3
      headerRowCount: 3,
      leftAlignDataCols: new Set([1, 2, 3, 4, 5]),
      year,
    },
    extraHeaderRows: [colHeaderRow],
    extraHeaderMerges: extraMerges,
    rows,
    staffGroups,
  };

  const ws = buildSheet(sheetData);
  writeWorkbook(
    ws,
    'Chấm công theo ca',
    `cham_cong_theo_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`,
  );
}
