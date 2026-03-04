import { useMemo } from 'react';
import dayjs from 'dayjs';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import type { ExcelColumnDef, ExcelExportConfig } from '@/hooks/use-excel-io';

import { dayNames, getDaysInMonth, getWeeksInMonth } from '../../helper';
import { useCurrentLayout } from '../../hooks/use-current-layout';
import { useYearMonth } from '../../hooks/use-year-month';
import { STAFF_POSITION } from '../constants/data';

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
