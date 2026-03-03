import { useMemo } from 'react';
import dayjs from 'dayjs';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import type { ExcelColumnDef, ExcelExportConfig } from '@/hooks/use-excel-io';

import { dayNames, getDaysInMonth, getWeeksInMonth } from '../../helper';
import { useCurrentLayout } from '../../hooks/use-current-layout';
import { useYearMonth } from '../../hooks/use-year-month';

type ShiftExportRow = Record<string, string | number>;

const FIXED_COLUMNS: ExcelColumnDef<ShiftExportRow>[] = [
  { header: 'STT', key: 'stt', width: 6 },
  { header: 'Mã NV', key: 'employeeCode', width: 14 },
  { header: 'Họ và tên', key: 'employeeName', width: 24 },
  { header: 'Khoa/Phòng ban', key: 'department', width: 22 },
  { header: 'Phòng', key: 'room', width: 20 },
  { header: 'Chức vụ', key: 'position', width: 16 },
];

// ─── Grid layout (BodyV2) ─────────────────────────────────────────────────────
// maxShiftsPerDay = max shifts trên toàn bộ ngày của NV đó (giống BodyV2)
// → mỗi NV 1 row, mỗi ngày có N cột slot = globalMaxSlots
const buildGridExport = (
  data: StaffSchedule[],
  year: number,
  month: number,
): { columns: ExcelColumnDef<ShiftExportRow>[]; rows: ShiftExportRow[] } => {
  const days = getDaysInMonth(year, month);

  // maxShiftsPerStaff[staffId]: giống BodyV2's maxShiftsPerDay
  const maxShiftsPerStaff: Record<string, number> = {};
  data.forEach((record) => {
    const max = Math.max(
      1,
      ...days.map((d) => record.schedules?.find((s) => s.date === d.date)?.shifts?.length ?? 0),
    );
    maxShiftsPerStaff[record.staff.id] = max;
  });

  const globalMaxSlots = Math.max(1, ...Object.values(maxShiftsPerStaff));

  // Build dynamic day columns
  const dayCols: ExcelColumnDef<ShiftExportRow>[] = [];
  days.forEach((d) => {
    const dayLabel = `${dayNames[d.dayOfWeek]}\n${dayjs(d.date).format('D/M/YY')}`;
    for (let i = 0; i < globalMaxSlots; i++) {
      dayCols.push({
        header: globalMaxSlots === 1 ? dayLabel : `${dayLabel}\n(${i + 1})`,
        key: `d_${d.date}_${i}`,
        width: 22,
      });
    }
  });

  // Build rows
  const rows = data.map((record, idx) => {
    const { staff, schedules = [] } = record;
    const maxSlots = maxShiftsPerStaff[staff.id] ?? 1;

    const row: ShiftExportRow = {
      stt: idx + 1,
      employeeCode: staff.code ?? '',
      employeeName: staff.name ?? '',
      department: staff.departments?.map((d) => d.name).join(', ') ?? '',
      room: staff.rooms?.map((r) => r.name).join(', ') ?? '',
      position: staff.position ?? '',
    };

    days.forEach((d) => {
      const shifts = schedules.find((s) => s.date === d.date)?.shifts ?? [];
      for (let i = 0; i < globalMaxSlots; i++) {
        const shift = i < maxSlots ? shifts[i] : undefined;
        row[`d_${d.date}_${i}`] = shift
          ? `${shift.shiftTemplateName}\n${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}`
          : '--';
      }
    });

    return row;
  });

  return { columns: [...FIXED_COLUMNS, ...dayCols], rows };
};

// ─── Table layout (useColumns) ────────────────────────────────────────────────
// maxShiftsPerRow[staffId]: max shifts trong 1 ngày bất kỳ của NV (giống useColumns)
// → mỗi NV 1 row, cột theo tuần → ngày
const buildTableExport = (
  data: StaffSchedule[],
  year: number,
  month: number,
): { columns: ExcelColumnDef<ShiftExportRow>[]; rows: ShiftExportRow[] } => {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);

  const maxShiftsPerRow: Record<string, number> = {};
  data.forEach((record) => {
    let max = 0;
    record.schedules?.forEach((schedule) => {
      const d = dayjs(schedule.date);
      if (d.month() !== month || d.year() !== year) return;
      const count = schedule.shifts?.length ?? 0;
      if (count > max) max = count;
    });
    maxShiftsPerRow[record.staff.id] = max;
  });

  const globalMaxSlots = Math.max(1, ...Object.values(maxShiftsPerRow));

  const dayCols: ExcelColumnDef<ShiftExportRow>[] = [];
  allDays.forEach((day) => {
    const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
    const dayLabel = `${dayNames[day.dayOfWeek]}\n${dayjs(dateStr).format('D/M/YY')}`;
    for (let i = 0; i < globalMaxSlots; i++) {
      dayCols.push({
        header: globalMaxSlots === 1 ? dayLabel : `${dayLabel}\n(${i + 1})`,
        key: `d_${dateStr}_${i}`,
        width: 22,
      });
    }
  });

  const rows = data.map((record, idx) => {
    const { staff, schedules = [] } = record;
    const maxSlots = maxShiftsPerRow[staff.id] ?? 1;

    const row: ShiftExportRow = {
      stt: idx + 1,
      employeeCode: staff.code ?? '',
      employeeName: staff.name ?? '',
      department: staff.departments?.map((d) => d.name).join(', ') ?? '',
      room: staff.rooms?.map((r) => r.name).join(', ') ?? '',
      position: staff.position ?? '',
    };

    allDays.forEach((day) => {
      const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
      const shifts = schedules.find((s) => s.date === dateStr)?.shifts ?? [];
      for (let i = 0; i < globalMaxSlots; i++) {
        const shift = i < maxSlots ? shifts[i] : undefined;
        row[`d_${dateStr}_${i}`] = shift
          ? `${shift.shiftTemplateName}\n${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}`
          : '--';
      }
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
