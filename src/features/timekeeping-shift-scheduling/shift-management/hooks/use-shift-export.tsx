import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStaffList } from '@/query-options/staff';
import { shiftManagementQueryOptions } from '@/services/query-options/shift-management.query';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import type { Staff } from '@/types/shift-management.type';

import { dayNames, getDaysInMonth, getWeeksInMonth } from '../../helper';
import { useCurrentLayout } from '../../hooks/use-current-layout';
import { useYearMonth } from '../../hooks/use-year-month';
import { STAFF_POSITION } from '../constants/data';

const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

export const exportTableToExcel = (data: StaffSchedule[], year: number, month: number) => {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);

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
  const totalCols = FIXED_COL_COUNT + allDays.length;

  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  const row0: unknown[] = [`BẢNG PHÂN CA THÁNG ${month + 1} NĂM ${year}`];
  for (let i = 1; i < totalCols; i++) row0.push('');
  aoa.push(row0);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  const row1: unknown[] = ['', '', '', '', ''];
  weeks.forEach((week) => {
    row1.push(
      `TUẦN ${week.weekNumber}: ${week.startDay}/${month + 1} - ${week.endDay}/${month + 1}`,
    );
    for (let i = 1; i < week.days.length; i++) row1.push('');
  });
  aoa.push(row1);

  let weekColStart = FIXED_COL_COUNT;
  weeks.forEach((week) => {
    if (week.days.length > 1) {
      merges.push({
        s: { r: 1, c: weekColStart },
        e: { r: 1, c: weekColStart + week.days.length - 1 },
      });
    }
    weekColStart += week.days.length;
  });

  const row2: unknown[] = ['STT', 'Khoa/phòng', 'Mã nhân viên', 'Tên nhân viên', 'Chức vụ'];
  allDays.forEach((day) => {
    const dateStr = dayjs(new Date(year, month, day.day)).format('D/M/YY');
    row2.push(`${DAY_SHORT[day.dayOfWeek]}\n${dateStr}`);
  });
  aoa.push(row2);

  let currentRow = 3;
  const staffRowStart: number[] = [];

  data.forEach((record, idx) => {
    const { staff, schedules = [] } = record;
    const numSlots = maxShiftsPerRow[staff.id] ?? 1;
    const numRows = numSlots * 2;

    staffRowStart.push(currentRow);

    for (let c = 0; c < FIXED_COL_COUNT; c++) {
      if (numRows > 1) {
        merges.push({
          s: { r: currentRow, c },
          e: { r: currentRow + numRows - 1, c },
        });
      }
    }

    for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
      const nameRow: unknown[] =
        slotIdx === 0
          ? [
              idx + 1,
              staff.departments?.map((d) => d.name).join('\n') ?? '',
              staff.code ?? '',
              staff.name ?? '',
              STAFF_POSITION[staff.position] ?? '',
            ]
          : ['', '', '', '', ''];

      const timeRow: unknown[] = ['', '', '', '', ''];

      allDays.forEach((day) => {
        const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
        const shifts = schedules.find((s) => s.date === dateStr)?.shifts ?? [];
        const shift = shifts[slotIdx];
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

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    ...allDays.map(() => ({ wch: 14 })),
  ];
  ws['!rows'] = [{ hpt: 40 }];

  const border = {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  };
  const centerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true };
  const leftAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };
  const leftAlignCols = new Set([1, 2, 3, 4]);

  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };

      const isLeftCol = R >= 3 && leftAlignCols.has(C);
      const alignment = isLeftCol ? leftAlignment : centerAlignment;

      if (R === 0) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '374151' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
        };
      } else if (R === 1) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '6B7280' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        };
      } else if (R === 2) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '9CA3AF' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        };
      } else {
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        const isEven = staffIdx % 2 === 0;
        ws[cellAddress].s = {
          alignment,
          border,
          fill: { fgColor: { rgb: isEven ? 'FFFFFF' : 'F9FAFB' } },
          font: { sz: 10 },
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Phân ca');
  XLSX.writeFile(wb, `phan_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`);
};

export const exportGridToExcel = (data: StaffSchedule[], year: number, month: number) => {
  const days = getDaysInMonth(year, month);

  const maxShiftsPerStaff: Record<string, number> = {};
  data.forEach((record) => {
    const max = Math.max(
      1,
      ...days.map((d) => record.schedules?.find((s) => s.date === d.date)?.shifts?.length ?? 0),
    );
    maxShiftsPerStaff[record.staff.id] = max;
  });

  const FIXED_COL_COUNT = 6;
  const totalCols = FIXED_COL_COUNT + days.length;

  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  const row0: unknown[] = [`BẢNG PHÂN CA THÁNG ${month + 1} NĂM ${year}`];
  for (let i = 1; i < totalCols; i++) row0.push('');
  aoa.push(row0);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  const row1: unknown[] = ['STT', 'Mã NV', 'Họ và tên', 'Khoa/Phòng ban', 'Phòng', 'Chức vụ'];
  days.forEach((d) => row1.push(`${dayNames[d.dayOfWeek]}\n${dayjs(d.date).format('D/M/YY')}`));
  aoa.push(row1);

  let currentRow = 2;
  const staffRowStart: number[] = [];

  data.forEach((record, idx) => {
    const { staff, schedules = [] } = record;
    const numSlots = maxShiftsPerStaff[staff.id] ?? 1;
    const numRows = numSlots * 2;

    staffRowStart.push(currentRow);

    for (let c = 0; c < FIXED_COL_COUNT; c++) {
      if (numRows > 1) {
        merges.push({
          s: { r: currentRow, c },
          e: { r: currentRow + numRows - 1, c },
        });
      }
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
              STAFF_POSITION[staff.position] ?? '',
            ]
          : ['', '', '', '', '', ''];

      const timeRow: unknown[] = ['', '', '', '', '', ''];

      days.forEach((d) => {
        const shifts = schedules.find((s) => s.date === d.date)?.shifts ?? [];
        const shift = shifts[slotIdx];
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

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;
  ws['!rows'] = [{ hpt: 40 }];
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 24 },
    { wch: 30 },
    { wch: 20 },
    { wch: 16 },
    ...days.map(() => ({ wch: 16 })),
  ];

  const border = {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  };
  const centerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true };
  const leftAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };
  const leftAlignCols = new Set([1, 2, 3, 4, 5]);

  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };

      const isLeftCol = R >= 2 && leftAlignCols.has(C);

      if (R === 0) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '374151' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
        };
      } else if (R === 1) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '6B7280' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        };
      } else {
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        const isEven = staffIdx % 2 === 0;
        ws[cellAddress].s = {
          alignment: isLeftCol ? leftAlignment : centerAlignment,
          border,
          fill: { fgColor: { rgb: isEven ? 'FFFFFF' : 'F9FAFB' } },
          font: { sz: 10 },
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Phân ca');
  XLSX.writeFile(wb, `phan_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`);
};

export const exportTemplateToExcel = (data: Staff[], year: number, month: number) => {
  const days = getDaysInMonth(year, month);

  const FIXED_COL_COUNT = 5;
  const totalCols = FIXED_COL_COUNT + days.length;

  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  // ── Row 0: Công ty + Tiêu đề ─────────────────────────────────────────────────
  const row0: unknown[] = ['CÔNG TY TNHH', '', '', `BẢNG PHÂN CA THÁNG ${month + 1} NĂM ${year}`];
  for (let i = 4; i < totalCols; i++) row0.push('');
  aoa.push(row0);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
  merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } });

  // ── Row 1: Bệnh viện + Khoa ──────────────────────────────────────────────────
  const row1: unknown[] = ['BỆNH VIỆN ĐA KHOA', '', '', 'KHOA'];
  for (let i = 4; i < totalCols; i++) row1.push('');
  aoa.push(row1);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } });
  merges.push({ s: { r: 1, c: 3 }, e: { r: 1, c: totalCols - 1 } });

  // ── Row 2: THÁNG ─────────────────────────────────────────────────────────────
  const row2: unknown[] = ['', '', '', '', '', 'THÁNG'];
  for (let i = 1; i < days.length; i++) row2.push('');
  aoa.push(row2);
  merges.push({ s: { r: 2, c: 5 }, e: { r: 2, c: totalCols - 1 } });

  // ── Row 3: Số ngày ───────────────────────────────────────────────────────────
  const row3: unknown[] = ['', '', '', '', ''];
  days.forEach((d) => row3.push(dayjs(d.date).date()));
  aoa.push(row3);

  // Merge cột cố định rows 2-3
  for (let c = 0; c < FIXED_COL_COUNT; c++) {
    merges.push({ s: { r: 2, c }, e: { r: 3, c } });
  }

  // ── Row 4: Header cột ────────────────────────────────────────────────────────
  const row4: unknown[] = [
    'STT',
    'Khoa/phòng (*)',
    'Mã nhân viên (*)',
    'Tên nhân viên (*)',
    'Chức vụ',
  ];
  days.forEach((d) => row4.push(DAY_SHORT[d.dayOfWeek]));
  aoa.push(row4);

  // ── Data rows — điền sẵn danh sách NV ───────────────────────────────────────
  let currentRow = 5;
  const staffRowStart: number[] = [];

  data.forEach((staff, idx) => {
    staffRowStart.push(currentRow);
    const dataRow: unknown[] = [
      idx + 1,
      staff.departments?.map((d) => d.name).join('\n') ?? '',
      staff.code ?? '',
      staff.name ?? '',
      STAFF_POSITION[staff.position ?? ''] ?? '',
    ];
    for (let d = 0; d < days.length; d++) dataRow.push('');
    aoa.push(dataRow);
    currentRow += 1;
  });

  // ── Footer ───────────────────────────────────────────────────────────────────
  aoa.push([]);
  aoa.push(['', '', '', '', '', `….............., ngày __ tháng __ năm ${year}`]);
  aoa.push(['Trưởng Đơn Vị', '', '', 'TL.Hành chánh - Nhân sự', '', '', '', 'Lập Bảng']);

  // ── Build workbook ───────────────────────────────────────────────────────────
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

  const border = {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  };
  const centerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true };
  const leftAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };

  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };

      if (R <= 1) {
        ws[cellAddress].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
      } else if (R === 2) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'BFDBFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      } else if (R === 3) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '93C5FD' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      } else if (R === 4) {
        ws[cellAddress].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      } else {
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        const isEven = staffIdx % 2 === 0;
        const isDateCol = C >= FIXED_COL_COUNT;
        ws[cellAddress].s = {
          alignment: C < FIXED_COL_COUNT && C > 0 ? leftAlignment : centerAlignment,
          border,
          fill: { fgColor: { rgb: isDateCol ? 'FFFFFF' : isEven ? 'FFFFFF' : 'EFF6FF' } },
          font: { sz: 10 },
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Phân ca');
  XLSX.writeFile(wb, `mau_phan_ca_thang_${month + 1}_${year}.xlsx`);
};

export const useShiftExport = () => {
  const { month, year } = useYearMonth();
  const currentLayout = useCurrentLayout();
  const isGrid = currentLayout === LayoutSwitcherEnum.GRID;
  const queryClient = useQueryClient();
  const { data: staffList } = useStaffList({
    page: 1,
    limit: 100,
  });
  const onExport = useCallback(async () => {
    const result = await queryClient.fetchQuery(
      shiftManagementQueryOptions.list({
        getAll: true,
      }),
    );
    const data = result?.data ?? [];

    if (isGrid) {
      exportGridToExcel(data, year, month);
    } else {
      exportTableToExcel(data, year, month);
    }
  }, [isGrid, year, month, queryClient]);

  const onExportTemplate = useCallback(async () => {
    exportTemplateToExcel(staffList?.data, year, month);
  }, [staffList?.data, year, month]);

  return { onExport, onExportTemplate };
};
