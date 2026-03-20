import { useCallback } from 'react';
import i18n from '@/i18n';
import { useStaffList } from '@/query-options/staff';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum, StaffPosition } from '@/types/global.type';
import type { Staff } from '@/types/shift-management.type';

import { getDaysInMonth, getWeeksInMonth } from '../../helper';
import { useCurrentLayout } from '../../hooks/use-current-layout';
import { useYearMonth } from '../../hooks/use-year-month';

const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

const tx = (key: string, options?: object) =>
  i18n.t(`timekeeping-shift-scheduling:${key}`, options);

const getStaffPositionMap = (): Record<string, string> => ({
  [StaffPosition.STAFF]: tx('staff_position.staff'),
  [StaffPosition.HEAD_OF_DEPARTMENT]: tx('staff_position.head_of_department'),
  [StaffPosition.DEPUTY_HEAD_OF_DEPARTMENT]: tx('staff_position.deputy_head_of_department'),
  [StaffPosition.CHIEF_NURSE]: tx('staff_position.chief_nurse'),
  [StaffPosition.MANAGER]: tx('staff_position.manager'),
  [StaffPosition.HEAD_OF_UNIT]: tx('staff_position.head_of_unit'),
  [StaffPosition.DEPUTY_MANAGER]: tx('staff_position.deputy_manager'),
});

// ── Shared footer ─────────────────────────────────────────────────────────────
const buildFooterRows = (totalCols: number, year: number) => {
  const dateOffset = Math.floor(totalCols * 0.45);
  const col1 = Math.floor(totalCols * 0.05);
  const col2 = Math.floor(totalCols * 0.38);
  const col3 = dateOffset + 2;

  const footerDateRow: unknown[] = Array(dateOffset).fill('');
  footerDateRow.push(tx('print.footer_date', { year }));

  const footerSignRow: unknown[] = Array(totalCols).fill('');
  footerSignRow[col1] = tx('print.footer_unit_head');
  footerSignRow[col2] = tx('print.footer_hr');
  footerSignRow[col3] = tx('print.footer_prepared_by');

  return { footerDateRow, footerSignRow };
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const border = {
  top: { style: 'thin', color: { rgb: 'D1D5DB' } },
  bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
  left: { style: 'thin', color: { rgb: 'D1D5DB' } },
  right: { style: 'thin', color: { rgb: 'D1D5DB' } },
};
const centerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true };
const leftAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };

export const exportTableToExcel = (
  data: StaffSchedule[],
  year: number,
  month: number,
  departmentName: string = '',
) => {
  const days = getDaysInMonth(year, month);
  const weeks = getWeeksInMonth(year, month);
  const staffPos = getStaffPositionMap(); // ✅ gọi tại runtime

  const maxShiftsPerRow: Record<string, number> = {};
  data.forEach((record) => {
    let max = 1;
    record.schedules?.forEach((schedule) => {
      const d = dayjs(schedule.date);
      if (d.month() !== month || d.year() !== year) return;
      const count = schedule.shifts?.length ?? 0;
      if (count > max) max = count;
    });
    maxShiftsPerRow[record.staff.id] = max;
  });

  const FIXED_COL_COUNT = 5;
  const totalCols = FIXED_COL_COUNT + days.length;
  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  // ── Row 0 ─────────────────────────────────────────────────────────────────
  aoa.push([
    tx('print.company_name_1'),
    '',
    '',
    tx('print.title', { month: month + 1, year }),
    ...Array(totalCols - 4).fill(''),
  ]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
  merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } });

  // ── Row 1 ─────────────────────────────────────────────────────────────────
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

  // ── Row 2: TUẦN ───────────────────────────────────────────────────────────
  const row2: unknown[] = ['', '', '', '', ''];
  weeks.forEach((week) => {
    row2.push(
      `${tx('columns.week', { week: week.weekNumber })}: ${week.startDay}/${month + 1} - ${week.endDay}/${month + 1}`,
    );
    for (let i = 1; i < week.days.length; i++) row2.push('');
  });
  aoa.push(row2);
  for (let c = 0; c < FIXED_COL_COUNT; c++) merges.push({ s: { r: 2, c }, e: { r: 3, c } });
  let weekColOffset = FIXED_COL_COUNT;
  weeks.forEach((week) => {
    if (week.days.length > 1)
      merges.push({
        s: { r: 2, c: weekColOffset },
        e: { r: 2, c: weekColOffset + week.days.length - 1 },
      });
    weekColOffset += week.days.length;
  });

  // ── Row 3 ─────────────────────────────────────────────────────────────────
  const row3: unknown[] = ['', '', '', '', ''];
  days.forEach((d) => row3.push(dayjs(d.date).date()));
  aoa.push(row3);

  // ── Row 4: Header ─────────────────────────────────────────────────────────
  aoa.push([
    tx('columns.stt'),
    tx('print.dept_room'),
    tx('print.employee_code_short'),
    tx('print.full_name'),
    tx('print.position'),
    ...days.map((d) => DAY_SHORT[d.dayOfWeek]),
  ]);

  // ── Data rows ─────────────────────────────────────────────────────────────
  let currentRow = 5;
  const staffRowStart: number[] = [];

  data.forEach((record, idx) => {
    const { staff, schedules = [] } = record;
    const numSlots = maxShiftsPerRow[staff.id] ?? 1;
    const numRows = numSlots * 2;
    staffRowStart.push(currentRow);
    for (let c = 0; c < FIXED_COL_COUNT; c++) {
      if (numRows > 1)
        merges.push({ s: { r: currentRow, c }, e: { r: currentRow + numRows - 1, c } });
    }
    for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
      const nameRow: unknown[] =
        slotIdx === 0
          ? [
              idx + 1,
              staff.departments?.map((d) => d.name).join('\n') ?? '',
              staff.code ?? '',
              staff.name ?? '',
              staffPos[staff.position] ?? '',
            ]
          : ['', '', '', '', ''];
      const timeRow: unknown[] = ['', '', '', '', ''];
      days.forEach((d) => {
        const shift = schedules.find((s) => s.date === d.date)?.shifts?.[slotIdx];
        nameRow.push(shift ? shift.shiftTemplateName : '');
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
  const { footerDateRow, footerSignRow } = buildFooterRows(totalCols, year);
  aoa.push([], [], [], footerDateRow, [], footerSignRow);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 8 },
    { wch: 16 },
    { wch: 17 },
    { wch: 19 },
    { wch: 13 },
    ...days.map(() => ({ wch: 10 })),
  ];
  ws['!rows'] = [{ hpt: 20 }, { hpt: 20 }];
  _applyTableStyles(ws, lastDataRow, FIXED_COL_COUNT, staffRowStart);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tx('print.sheet_name'));
  XLSX.writeFile(wb, `phan_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`);
};

export const exportGridToExcel = (
  data: StaffSchedule[],
  year: number,
  month: number,
  departmentName: string = '',
) => {
  const days = getDaysInMonth(year, month);
  const staffPos = getStaffPositionMap();

  const maxShiftsPerStaff: Record<string, number> = {};
  data.forEach((record) => {
    maxShiftsPerStaff[record.staff.id] = Math.max(
      1,
      ...days.map((d) => record.schedules?.find((s) => s.date === d.date)?.shifts?.length ?? 0),
    );
  });

  const FIXED_COL_COUNT = 6;
  const totalCols = FIXED_COL_COUNT + days.length;
  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  aoa.push([
    tx('print.company_name_1'),
    '',
    '',
    tx('print.title', { month: month + 1, year }),
    ...Array(totalCols - 4).fill(''),
  ]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
  merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } });

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

  aoa.push(['', '', '', '', '', '', ...days.map((d) => dayjs(d.date).date())]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: FIXED_COL_COUNT - 1 } });

  aoa.push([
    tx('columns.stt'),
    tx('print.employee_code_short'),
    tx('print.full_name'),
    tx('print.dept_room'),
    tx('filter.room'), // "Phòng" — reuse common hoặc thêm key mới
    tx('print.position'),
    ...days.map((d) => DAY_SHORT[d.dayOfWeek]),
  ]);

  let currentRow = 4;
  const staffRowStart: number[] = [];

  data.forEach((record, idx) => {
    const { staff, schedules = [] } = record;
    const numSlots = maxShiftsPerStaff[staff.id] ?? 1;
    const numRows = numSlots * 2;
    staffRowStart.push(currentRow);
    for (let c = 0; c < FIXED_COL_COUNT; c++) {
      if (numRows > 1)
        merges.push({ s: { r: currentRow, c }, e: { r: currentRow + numRows - 1, c } });
    }
    for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
      const nameRow: unknown[] =
        slotIdx === 0
          ? [
              idx + 1,
              staff.code ?? '',
              staff.name ?? '',
              staff.departments?.map((d) => d.name).join('\n') ?? '',
              staff.rooms?.map((r) => r.name).join('\n') ?? '',
              staffPos[staff.position] ?? '',
            ]
          : ['', '', '', '', '', ''];
      const timeRow: unknown[] = ['', '', '', '', '', ''];
      days.forEach((d) => {
        const shift = schedules.find((s) => s.date === d.date)?.shifts?.[slotIdx];
        nameRow.push(shift ? shift.shiftTemplateName : '');
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
  const { footerDateRow, footerSignRow } = buildFooterRows(totalCols, year);
  aoa.push([], [], [], footerDateRow, [], footerSignRow);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;
  ws['!rows'] = [{ hpt: 20 }, { hpt: 20 }];
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 24 },
    { wch: 30 },
    { wch: 20 },
    { wch: 16 },
    ...days.map(() => ({ wch: 16 })),
  ];
  _applyGridStyles(ws, lastDataRow, FIXED_COL_COUNT, staffRowStart);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tx('print.sheet_name'));
  XLSX.writeFile(wb, `phan_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`);
};

export const exportTemplateToExcel = (data: Staff[], year: number, month: number) => {
  const days = getDaysInMonth(year, month);
  const staffPos = getStaffPositionMap();
  const FIXED_COL_COUNT = 5;
  const totalCols = FIXED_COL_COUNT + days.length;
  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  aoa.push([
    tx('print.company_name_1'),
    '',
    '',
    tx('print.title', { month: month + 1, year }),
    ...Array(totalCols - 4).fill(''),
  ]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
  merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } });

  aoa.push([
    tx('print.company_name_2'),
    '',
    '',
    tx('print.department_label'),
    ...Array(totalCols - 4).fill(''),
  ]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } });
  merges.push({ s: { r: 1, c: 3 }, e: { r: 1, c: totalCols - 1 } });

  aoa.push(['', '', '', '', '', tx('print.month_label'), ...Array(days.length - 1).fill('')]);
  merges.push({ s: { r: 2, c: 5 }, e: { r: 2, c: totalCols - 1 } });

  aoa.push(['', '', '', '', '', ...days.map((d) => dayjs(d.date).date())]);
  for (let c = 0; c < FIXED_COL_COUNT; c++) merges.push({ s: { r: 2, c }, e: { r: 3, c } });

  aoa.push([
    tx('columns.stt'),
    tx('print.dept_room_required'),
    tx('print.employee_code_required'),
    tx('print.full_name_required'),
    tx('print.position'),
    ...days.map((d) => DAY_SHORT[d.dayOfWeek]),
  ]);

  let currentRow = 5;
  const staffRowStart: number[] = [];
  data.forEach((staff, idx) => {
    staffRowStart.push(currentRow);
    const dataRow: unknown[] = [
      idx + 1,
      staff.departments?.map((d) => d.name).join('\n') ?? '',
      staff.code ?? '',
      staff.name ?? '',
      staffPos[staff.position ?? ''] ?? '',
    ];
    for (let d = 0; d < days.length; d++) dataRow.push('');
    aoa.push(dataRow);
    currentRow += 1;
  });

  const lastDataRow = currentRow - 1;
  const { footerDateRow, footerSignRow } = buildFooterRows(totalCols, year);
  aoa.push([], [], [], footerDateRow, [], footerSignRow);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    ...days.map(() => ({ wch: 10 })),
  ];
  ws['!rows'] = [{ hpt: 20 }, { hpt: 20 }];
  _applyTemplateStyles(ws, lastDataRow, FIXED_COL_COUNT, staffRowStart);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tx('print.sheet_name'));
  XLSX.writeFile(wb, `mau_phan_ca_thang_${month + 1}_${year}.xlsx`);
};

// ── Style helpers (tách ra để tránh lặp) ─────────────────────────────────────
const _applyTableStyles = (
  ws: XLSX.WorkSheet,
  lastDataRow: number,
  fixedCols: number,
  staffRowStart: number[],
) => {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      if (R > lastDataRow) {
        ws[addr].s = { alignment: centerAlignment, font: { sz: 10 } };
        continue;
      }
      if (R <= 1)
        ws[addr].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
      else if (R === 2)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'BFDBFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 3)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '93C5FD' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 4)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else {
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        const isDateCol = C >= fixedCols;
        ws[addr].s = {
          alignment: C > 0 && C < fixedCols ? leftAlignment : centerAlignment,
          border,
          fill: {
            fgColor: { rgb: isDateCol ? 'FFFFFF' : staffIdx % 2 === 0 ? 'FFFFFF' : 'EFF6FF' },
          },
          font: { sz: 10 },
        };
      }
    }
  }
};

const _applyGridStyles = (
  ws: XLSX.WorkSheet,
  lastDataRow: number,
  fixedCols: number,
  staffRowStart: number[],
) => {
  const leftAlignCols = new Set([1, 2, 3, 4, 5]);
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      if (R > lastDataRow) {
        ws[addr].s = { alignment: centerAlignment, font: { sz: 10 } };
        continue;
      }
      if (R <= 1)
        ws[addr].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
      else if (R === 2)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '93C5FD' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 3)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else {
        const isLeft = R >= 4 && leftAlignCols.has(C);
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        ws[addr].s = {
          alignment: isLeft ? leftAlignment : centerAlignment,
          border,
          fill: { fgColor: { rgb: staffIdx % 2 === 0 ? 'FFFFFF' : 'F9FAFB' } },
          font: { sz: 10 },
        };
      }
    }
  }
};

const _applyTemplateStyles = (
  ws: XLSX.WorkSheet,
  lastDataRow: number,
  fixedCols: number,
  staffRowStart: number[],
) => {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      if (R > lastDataRow) {
        ws[addr].s = { alignment: centerAlignment, font: { sz: 10 } };
        continue;
      }
      if (R <= 1)
        ws[addr].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
      else if (R === 2)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'BFDBFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 3)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '93C5FD' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 4)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else {
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        const isDateCol = C >= fixedCols;
        ws[addr].s = {
          alignment: C < fixedCols && C > 0 ? leftAlignment : centerAlignment,
          border,
          fill: {
            fgColor: { rgb: isDateCol ? 'FFFFFF' : staffIdx % 2 === 0 ? 'FFFFFF' : 'EFF6FF' },
          },
          font: { sz: 10 },
        };
      }
    }
  }
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useShiftExport = (data: StaffSchedule[] = [], departmentName?: string) => {
  const { month, year } = useYearMonth();
  const currentLayout = useCurrentLayout();
  const isGrid = currentLayout === LayoutSwitcherEnum.GRID;
  const { data: staffList } = useStaffList({ page: 1, limit: 100 });

  const onExport = useCallback(async () => {
    await i18n.loadNamespaces('timekeeping-shift-scheduling');
    if (isGrid) exportGridToExcel(data, year, month, departmentName);
    else exportTableToExcel(data, year, month, departmentName);
  }, [isGrid, data, year, month, departmentName]);

  const onExportTemplate = useCallback(async () => {
    await i18n.loadNamespaces('timekeeping-shift-scheduling');
    exportTemplateToExcel(staffList?.data ?? [], year, month);
  }, [staffList?.data, year, month]);

  return { onExport, onExportTemplate };
};
