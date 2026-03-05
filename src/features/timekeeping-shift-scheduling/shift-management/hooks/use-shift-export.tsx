import { useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import type { ExcelColumnDef, ExcelExportConfig } from '@/hooks/use-excel-io';

import { dayNames, getDaysInMonth, getWeeksInMonth } from '../../helper';
import { useCurrentLayout } from '../../hooks/use-current-layout';
import { useYearMonth } from '../../hooks/use-year-month';
import { STAFF_POSITION } from '../constants/data';

// Map dayOfWeek → tên thứ kiểu file mẫu
const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

export const exportTableToExcel = (
  data: StaffSchedule[],
  year: number,
  month: number, // 0-indexed
  options?: { companyName?: string; hospitalName?: string; department?: string },
) => {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);

  // Tính maxShiftsPerRow[staffId] = max ca trong 1 ngày của NV
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

  // Số cột ngày = allDays.length, bắt đầu từ col index 5 (sau A-E)
  const FIXED_COL_COUNT = 5; // A=STT, B=Khoa, C=Mã NV, D=Tên, E=Chức vụ
  const totalCols = FIXED_COL_COUNT + allDays.length;
  const lastColLetter = XLSX.utils.encode_col(totalCols - 1);

  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  // ── Row 0: Công ty ──────────────────────────────────────────────────────────
  aoa.push([
    options?.companyName ?? '',
    '',
    '',
    'BẢNG PHÂN CA THÁNG ' + (month + 1) + ' NĂM ' + year,
  ]);

  // ── Row 1: Bệnh viện + Khoa ─────────────────────────────────────────────────
  aoa.push([options?.hospitalName ?? '', '', '', 'KHOA: ' + (options?.department ?? '')]);

  // ── Row 2: THÁNG (merge toàn bộ cột ngày) ──────────────────────────────────
  const row2: unknown[] = ['', '', '', '', '', 'THÁNG ' + (month + 1)];
  for (let i = 1; i < allDays.length; i++) row2.push('');
  aoa.push(row2);
  merges.push({ s: { r: 2, c: 5 }, e: { r: 2, c: totalCols - 1 } });

  // ── Row 3: Số ngày ──────────────────────────────────────────────────────────
  const row3: unknown[] = ['', '', '', '', ''];
  allDays.forEach((day) => row3.push(day.day));
  aoa.push(row3);

  // ── Row 4: Header (STT, Khoa, Mã NV, Tên, Chức vụ, T2, T3...) ─────────────
  const row4: unknown[] = [
    'STT',
    'Khoa/phòng (*)',
    'Mã nhân viên (*)',
    'Tên nhân viên (*)',
    'Chức vụ',
  ];
  allDays.forEach((day) => row4.push(DAY_SHORT[day.dayOfWeek]));
  aoa.push(row4);

  // ── Data rows ────────────────────────────────────────────────────────────────
  // Header chiếm row 0-4 → data bắt đầu từ row index 5
  let currentRow = 5;

  data.forEach((record, idx) => {
    const { staff, schedules = [] } = record;
    const numSlots = maxShiftsPerRow[staff.id] ?? 1;
    const numRows = numSlots * 2; // mỗi slot = 2 rows (tên ca + giờ)

    // Merge cột A-E theo numRows
    for (let c = 0; c < FIXED_COL_COUNT; c++) {
      if (numRows > 1) {
        merges.push({
          s: { r: currentRow, c },
          e: { r: currentRow + numRows - 1, c },
        });
      }
    }

    // Build 2 rows cho mỗi slot
    for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
      const nameRow: unknown[] =
        slotIdx === 0
          ? [
              idx + 1,
              staff.departments?.map((d) => d.name).join(', ') ?? '',
              staff.code ?? '',
              staff.name ?? '',
              staff.position ?? '',
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

  // ── Footer ──────────────────────────────────────────────────────────────────
  aoa.push([]);
  aoa.push(['', '', '', '', '', '….............., ngày __ tháng __ năm ' + year]);
  aoa.push(['Trưởng Đơn Vị', '', 'TL.Hành chánh - Nhân sự', '', '', '', 'Lập Bảng']);

  // ── Build workbook ──────────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;

  // Column widths
  ws['!cols'] = [
    { wch: 6 }, // A: STT
    { wch: 18 }, // B: Khoa
    { wch: 16 }, // C: Mã NV
    { wch: 22 }, // D: Tên
    { wch: 14 }, // E: Chức vụ
    ...allDays.map(() => ({ wch: 14 })), // Ngày
  ];

  // Merge header row 0: A1:C1 và D1:lastCol
  merges.unshift(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 1, c: 3 }, e: { r: 1, c: totalCols - 1 } },
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Phân ca');
  XLSX.writeFile(wb, `phan_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`);
};

type ShiftExportRow = Record<string, string | number>;

const FIXED_COLUMNS: ExcelColumnDef<ShiftExportRow>[] = [
  { header: 'STT', key: 'stt', width: 6 },
  { header: 'Mã NV', key: 'employeeCode', width: 14 },
  { header: 'Họ và tên', key: 'employeeName', width: 24 },
  { header: 'Khoa/Phòng ban', key: 'department', width: 22 },
  { header: 'Phòng', key: 'room', width: 20 },
  { header: 'Chức vụ', key: 'position', width: 16 },
];

const buildGridExport = (
  data: StaffSchedule[],
  year: number,
  month: number,
): {
  columns: ExcelColumnDef<ShiftExportRow>[];
  rows: ShiftExportRow[];
  merges: { s: { r: number; c: number }; e: { r: number; c: number } }[];
} => {
  const days = getDaysInMonth(year, month);

  const maxShiftsPerStaff: Record<string, number> = {};
  data.forEach((record) => {
    const max = Math.max(
      1,
      ...days.map((d) => record.schedules?.find((s) => s.date === d.date)?.shifts?.length ?? 0),
    );
    maxShiftsPerStaff[record.staff.id] = max;
  });

  const dayCols: ExcelColumnDef<ShiftExportRow>[] = days.map((d) => ({
    header: `${dayNames[d.dayOfWeek]}\n${dayjs(d.date).format('D/M/YY')}`,
    key: `d_${d.date}`,
    width: 22,
  }));

  const rows: ShiftExportRow[] = [];
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];

  let currentRow = 1;

  data.forEach((record, idx) => {
    const { staff, schedules = [] } = record;
    const numSlots = maxShiftsPerStaff[staff.id] ?? 1;

    if (numSlots > 1) {
      FIXED_COLUMNS.forEach((_, colIdx) => {
        merges.push({
          s: { r: currentRow, c: colIdx },
          e: { r: currentRow + numSlots - 1, c: colIdx },
        });
      });
    }

    for (let i = 0; i < numSlots; i++) {
      const row: ShiftExportRow = {
        stt: i === 0 ? idx + 1 : '',
        employeeCode: i === 0 ? (staff.code ?? '') : '',
        employeeName: i === 0 ? (staff.name ?? '') : '',
        department: i === 0 ? (staff.departments?.map((d) => d.name).join(', ') ?? '') : '',
        room: i === 0 ? (staff.rooms?.map((r) => r.name).join(', ') ?? '') : '',
        position: i === 0 ? (staff.position ?? '') : '',
      };

      days.forEach((d) => {
        const shifts = schedules.find((s) => s.date === d.date)?.shifts ?? [];
        const shift = shifts[i];
        row[`d_${d.date}`] = shift
          ? `${shift.shiftTemplateName}\n${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}`
          : '--';
      });

      rows.push(row);
    }

    currentRow += numSlots;
  });

  return { columns: [...FIXED_COLUMNS, ...dayCols], rows, merges };
};

const buildTableExport = (
  data: StaffSchedule[],
  year: number,
  month: number,
): { columns: ExcelColumnDef<ShiftExportRow>[]; rows: ShiftExportRow[] } => {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);

  const dayCols: ExcelColumnDef<ShiftExportRow>[] = [];

  weeks.forEach((week) => {
    week.days.forEach((day) => {
      const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
      dayCols.push({
        header: `${dayNames[day.dayOfWeek]}\n${dayjs(dateStr).format('D/M/YY')}`,
        key: `d_${dateStr}`,
        width: 22,
      });
    });
  });

  const rows = data.map((record, idx) => {
    const { staff, schedules = [] } = record;

    const row: ShiftExportRow = {
      stt: idx + 1,
      employeeCode: staff.code ?? '',
      employeeName: staff.name ?? '',
      department: staff.departments?.map((d) => d.name).join(', ') ?? '',
      room: staff.rooms?.map((r) => r.name).join(', ') ?? '',
      position: STAFF_POSITION?.[staff.position] ?? '',
    };

    allDays.forEach((day) => {
      const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
      const shifts = schedules.find((s) => s.date === dateStr)?.shifts ?? [];

      row[`d_${dateStr}`] = shifts.length
        ? shifts
            .map(
              (shift) =>
                `${shift.shiftTemplateName} ${shift.startTime?.slice(0, 5)}-${shift.endTime?.slice(0, 5)}`,
            )
            .join('\n')
        : '--';
    });

    return row;
  });

  return { columns: [...FIXED_COLUMNS, ...dayCols], rows };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useShiftExport = (data: StaffSchedule[] = []) => {
  const { month, year } = useYearMonth();
  const currentLayout = useCurrentLayout();
  const isGrid = currentLayout === LayoutSwitcherEnum.GRID;

  const exportConfig = useMemo<ExcelExportConfig<ShiftExportRow>>(() => {
    const { columns, rows } = isGrid
      ? buildGridExport(data, year, month)
      : buildTableExport(data, year, month);

    return {
      fileName: `phan_ca_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}`,
      sheetName: 'Phân ca',
      columns,
      data: rows,
      defaultRowHeight: 55,
      headerRowHeight: 42,
    };
  }, [data, year, month, isGrid]);

  return { exportConfig };
};
