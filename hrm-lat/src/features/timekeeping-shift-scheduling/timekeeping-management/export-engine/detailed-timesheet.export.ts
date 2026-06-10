import dayjs from 'dayjs';

import type { DetailsTimeSheetRecord } from '@/types/shift-details.type';
import { translatePosition } from '@/features/staff-management/time-attendance-management/helpers';

import { fillMissingDaysWithDayjs, getMonthRange } from '../../helper';
import { buildSheet, writeWorkbook, type SheetData } from './export.engine';

// DetailedTimeSheet is always a flat list (no grid layout variant)
// Each row = 1 DailyAttendance entry for a staff member

const FIXED_COLS = [
  { label: 'STT', wch: 6 },
  { label: 'Mã nhân viên', wch: 16, align: 'left' as const },
  { label: 'Tên nhân viên', wch: 22, align: 'left' as const },
  { label: 'Khoa/phòng', wch: 20, align: 'left' as const },
  { label: 'Phòng', wch: 18, align: 'left' as const },
  { label: 'Chức vụ', wch: 14, align: 'left' as const },
  { label: 'Ngày', wch: 12 },
  { label: 'Mã ca', wch: 10 },
  { label: 'Giờ chuẩn', wch: 12 },
  { label: 'Giờ vào', wch: 12 },
  { label: 'Giờ ra', wch: 12 },
  { label: 'Trễ (ph)', wch: 10 },
  { label: 'Sớm (ph)', wch: 10 },
  { label: 'Số công', wch: 10 },
  { label: 'Tổng giờ làm', wch: 12 },
  { label: 'Giờ OT', wch: 10 },
  { label: 'Giờ bù', wch: 10 },
];

export function exportDetailedTimeSheet(
  data: DetailsTimeSheetRecord[],
  year: number,
  month: number,
  departmentName: string = '',
) {
  const rows: SheetData['rows'] = [];
  const staffGroups: SheetData['staffGroups'] = [];
  const merges: import('xlsx-js-style').Range[] = [];

  // 2 company rows (prepended by buildSheet) + 1 col header row = 3
  // so data starts at row index 3
  let currentRow = 3;
  let globalIdx = 1;

  data.forEach((record) => {
    const { staff, days } = record;
    const { start, end } = getMonthRange(month + 1, year);
    const allDaysOfMonth = fillMissingDaysWithDayjs(
      days,
      dayjs(start).format('YYYY-MM-DD'),
      dayjs(end).format('YYYY-MM-DD'),
    );

    const numDays = Math.max(allDaysOfMonth?.length ?? 1, 1);
    staffGroups.push({ startRow: currentRow, rowCount: numDays });

    allDaysOfMonth?.forEach((day, dayIdx) => {
      const isFirst = dayIdx === 0;
      const cells: unknown[] = [
        globalIdx++,
        staff.code ?? '',
        staff.name ?? '',
        staff.departments?.map((it) => it.name)?.join(', ') ?? '',
        staff.rooms?.map((it) => it.name)?.join(', ') ?? '',
        translatePosition(staff.position ?? ''),
        dayjs(day.date).format('DD/MM/YYYY'),
        day.shiftCode ?? '',
        day.standardTime ?? '',
        day.checkInTime ?? '',
        day.checkOutTime ?? '',
        day.lateMinutes ?? '',
        day.earlyMinutes ?? '',
        day.workCount?.toFixed(2) ?? '',
        day.totalWorkHours?.toFixed(2) ?? '',
        day.overtimeHours?.toFixed(2) ?? '',
        day.compHours ?? '',
      ];

      rows.push({ cells, isContinuation: !isFirst });
      currentRow += 1;
    });
  });

  const colHeaderRow: unknown[] = FIXED_COLS.map((c) => c.label);

  const sheetData: SheetData = {
    config: {
      title: `BẢNG CHẤM CÔNG CHI TIẾT THÁNG ${month + 1} NĂM ${year}`,
      companyName1: 'TÊN CÔNG TY / ĐƠN VỊ',
      companyName2: 'Bộ phận / Phòng ban',
      departmentName,
      fixedCols: FIXED_COLS,
      dayCols: [],
      summaryCols: [],
      // 2 company rows + 1 col header row = 3
      headerRowCount: 3,
      leftAlignDataCols: new Set([1, 2, 3, 4, 5]),
      year,
    },
    extraHeaderRows: [colHeaderRow],
    extraHeaderMerges: merges,
    rows,
    staffGroups,
  };

  const ws = buildSheet(sheetData);
  writeWorkbook(
    ws,
    'Chấm công chi tiết',
    `cham_cong_chi_tiet_thang_${month + 1}_${year}_${dayjs().format('YYYYMMDD')}.xlsx`,
  );
}
