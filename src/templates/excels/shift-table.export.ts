import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import type { StaffSchedule } from '@/types';
import { getDaysInMonth, getWeeksInMonth } from '@/features/timekeeping-shift-scheduling/helper';

import { DAY_SHORT } from '../core/day-utils';
import { buildFooterRows } from '../core/footer.builder';
import { getStaffPositionMap, tx } from '../core/i18n';
import { dataStyle, footerStyle, headerStyle, stripedBg, titleStyle } from '../core/styles';
import { applyStyleToRange, buildSheet, writeWorkbook } from '../core/xlsx-builder';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FIXED = 5; // STT | Phòng/Ban | Mã NV | Họ tên | Chức vụ

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BuildAoaResult {
  aoa: unknown[][];
  merges: XLSX.Range[];
  staffRowStart: number[];
  lastDataRow: number;
}

interface BuildAoaParams {
  data: StaffSchedule[];
  days: ReturnType<typeof getDaysInMonth>;
  weeks: ReturnType<typeof getWeeksInMonth>;
  year: number;
  month: number;
  totalCols: number;
  maxShiftsPerRow: Record<string, number>;
  staffPos: Record<string, string>;
  departmentName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tính số ca tối đa trong 1 ngày của mỗi nhân viên
 * → xác định số dòng cần render cho mỗi nhân viên
 */
const buildMaxShiftsMap = (
  data: StaffSchedule[],
  year: number,
  month: number,
): Record<string, number> => {
  const map: Record<string, number> = {};

  data.forEach((record) => {
    let max = 1;
    record.schedules?.forEach((schedule) => {
      const d = dayjs(schedule.date);
      if (d.month() !== month || d.year() !== year) return;
      const count = schedule.shifts?.length ?? 0;
      if (count > max) max = count;
    });
    map[record.staff.id] = max;
  });

  return map;
};

// ─────────────────────────────────────────────────────────────────────────────
// AOA builder (pure — dễ unit test)
// ─────────────────────────────────────────────────────────────────────────────

const buildTableAoa = ({
  data,
  days,
  weeks,
  year,
  month,
  totalCols,
  maxShiftsPerRow,
  staffPos,
  departmentName,
}: BuildAoaParams): BuildAoaResult => {
  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];
  const staffRowStart: number[] = [];

  // ── Row 0: Tên công ty + Tiêu đề bảng ──────────────────────────────────────
  aoa.push([
    tx('print.company_name_1'),
    '',
    '',
    tx('print.title', { month: month + 1, year }),
    ...Array(totalCols - 4).fill(''),
  ]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
  merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } });

  // ── Row 1: Tên công ty 2 + Phòng ban ───────────────────────────────────────
  aoa.push([
    tx('print.company_name_2'),
    '',
    '',
    departmentName
      ? `${tx('print.department_label')}: ${departmentName}`
      : tx('print.department_label'),
    ...Array(totalCols - 4).fill(''),
  ]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } });
  merges.push({ s: { r: 1, c: 3 }, e: { r: 1, c: totalCols - 1 } });

  // ── Row 2: Tuần ────────────────────────────────────────────────────────────
  const row2: unknown[] = Array(FIXED).fill('');
  weeks.forEach((week) => {
    row2.push(
      `${tx('columns.week', { week: week.weekNumber })}: ${week.startDay}/${month + 1} - ${week.endDay}/${month + 1}`,
    );
    for (let i = 1; i < week.days.length; i++) row2.push('');
  });
  aoa.push(row2);

  // Merge các cột cố định theo chiều dọc (row 2 → 3)
  for (let c = 0; c < FIXED; c++) {
    merges.push({ s: { r: 2, c }, e: { r: 3, c } });
  }
  // Merge các cột theo tuần (row 2)
  let weekColOffset = FIXED;
  weeks.forEach((week) => {
    if (week.days.length > 1) {
      merges.push({
        s: { r: 2, c: weekColOffset },
        e: { r: 2, c: weekColOffset + week.days.length - 1 },
      });
    }
    weekColOffset += week.days.length;
  });

  // ── Row 3: Ngày trong tháng ────────────────────────────────────────────────
  const row3: unknown[] = Array(FIXED).fill('');
  days.forEach((d) => row3.push(dayjs(d.date).date()));
  aoa.push(row3);

  // ── Row 4: Header cột ──────────────────────────────────────────────────────
  aoa.push([
    tx('columns.stt'),
    tx('print.dept_room'),
    tx('print.employee_code_short'),
    tx('print.full_name'),
    tx('print.position'),
    ...days.map((d) => DAY_SHORT[d.dayOfWeek]),
  ]);

  // ── Rows 5+: Data ──────────────────────────────────────────────────────────
  let currentRow = 5;

  data.forEach((record, idx) => {
    const { staff, schedules = [] } = record;
    const numSlots = maxShiftsPerRow[staff.id] ?? 1;
    const numRows = numSlots * 2; // mỗi slot = 1 dòng tên ca + 1 dòng giờ

    staffRowStart.push(currentRow);

    // Merge các cột cố định theo chiều dọc cho nhân viên này
    if (numRows > 1) {
      for (let c = 0; c < FIXED; c++) {
        merges.push({ s: { r: currentRow, c }, e: { r: currentRow + numRows - 1, c } });
      }
    }

    for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
      // Dòng tên ca
      const nameRow: unknown[] =
        slotIdx === 0
          ? [
              idx + 1,
              staff.departments?.map((d) => d.name).join('\n') ?? '',
              staff.code ?? '',
              staff.name ?? '',
              staffPos[staff.position] ?? '',
            ]
          : Array(FIXED).fill('');

      // Dòng giờ
      const timeRow: unknown[] = Array(FIXED).fill('');

      days.forEach((d) => {
        const shift = schedules.find((s) => s.date === d.date)?.shifts?.[slotIdx];
        nameRow.push(shift?.shiftTemplateName ?? '');
        timeRow.push(
          shift ? `${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}` : '',
        );
      });

      aoa.push(nameRow);
      aoa.push(timeRow);
    }

    currentRow += numRows;
  });

  const lastDataRow = currentRow - 1;

  // ── Footer ─────────────────────────────────────────────────────────────────
  const { footerDateRow, footerSignRow } = buildFooterRows(totalCols, year);
  aoa.push([], [], [], footerDateRow, [], footerSignRow);

  return { aoa, merges, staffRowStart, lastDataRow };
};

// ─────────────────────────────────────────────────────────────────────────────
// Style applicator
// ─────────────────────────────────────────────────────────────────────────────

const applyTableStyles = (
  ws: XLSX.WorkSheet,
  lastDataRow: number,
  staffRowStart: number[],
): void => {
  applyStyleToRange(ws, (R, C) => {
    if (R > lastDataRow) return footerStyle();

    if (R <= 1) return titleStyle(C < 3);

    if (R === 2) return headerStyle('BFDBFE'); // xanh nhạt nhất — tuần
    if (R === 3) return headerStyle('93C5FD'); // xanh vừa — ngày
    if (R === 4) return headerStyle('DBEAFE'); // header cột

    // Data rows
    const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
    const isDateCol = C >= FIXED;

    return dataStyle({
      isLeft: C > 0 && C < FIXED,
      bgRgb: isDateCol ? 'FFFFFF' : stripedBg(staffIdx),
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Public export function
// ─────────────────────────────────────────────────────────────────────────────

export const exportTableToExcel = (
  data: StaffSchedule[],
  year: number,
  month: number,
  departmentName = '',
): void => {
  const days = getDaysInMonth(year, month);
  const weeks = getWeeksInMonth(year, month);
  const staffPos = getStaffPositionMap();
  const totalCols = FIXED + days.length;

  const maxShiftsPerRow = buildMaxShiftsMap(data, year, month);

  const { aoa, merges, staffRowStart, lastDataRow } = buildTableAoa({
    data,
    days,
    weeks,
    year,
    month,
    totalCols,
    maxShiftsPerRow,
    staffPos,
    departmentName,
  });

  const sheetName = tx('print.sheet_name');

  const ws = buildSheet({
    aoa,
    merges,
    colWidths: [8, 16, 17, 19, 13, ...days.map(() => 10)],
    rowHeights: [20, 20],
    sheetName,
    applyStyles: (ws) => applyTableStyles(ws, lastDataRow, staffRowStart),
  });

  writeWorkbook(
    ws,
    sheetName,
    `phan_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`,
  );
};
