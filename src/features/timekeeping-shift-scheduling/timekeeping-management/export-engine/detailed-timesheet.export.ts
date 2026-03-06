import dayjs from 'dayjs';

import type { DetailsTimeSheetRecord } from '@/types/shift-details.type';

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
) {
  const rows: SheetData['rows'] = [];
  const staffGroups: SheetData['staffGroups'] = [];
  const merges: import('xlsx-js-style').Range[] = [];

  let currentRow = 2; // title(0) + colHeader(1)
  let globalIdx = 1;

  data.forEach((record, staffIdx) => {
    const { staff, days } = record;
    const numDays = Math.max(days.length, 1);

    staffGroups.push({ startRow: currentRow, rowCount: numDays });

    // Merge fixed info cols across all day rows for this staff
    if (numDays > 1) {
      for (let c = 0; c < 6; c++) {
        merges.push({ s: { r: currentRow, c }, e: { r: currentRow + numDays - 1, c } });
      }
    }

    days.forEach((day, dayIdx) => {
      const isFirst = dayIdx === 0;
      const cells: unknown[] = isFirst
        ? [
            globalIdx++,
            staff.code ?? '',
            staff.name ?? '',
            staff.department ?? '',
            staff.room ?? '',
            staff.position ?? '',
          ]
        : ['', '', '', '', '', ''];

      cells.push(
        dayjs(day.date).format('DD/MM/YYYY'),
        day.shiftCode ?? '',
        day.standardTime ?? '',
        day.checkInTime ?? '',
        day.checkOutTime ?? '',
        day.lateMinutes ?? '',
        day.earlyMinutes ?? '',
        day.workCount ?? '',
        day.totalWorkHours ?? '',
        day.overtimeHours ?? '',
        day.compHours ?? '',
      );

      rows.push({ cells, isContinuation: !isFirst });
      currentRow += 1;
    });
  });

  const colHeaderRow: unknown[] = FIXED_COLS.map((c) => c.label);

  const sheetData: SheetData = {
    config: {
      title: `BẢNG CHẤM CÔNG CHI TIẾT THÁNG ${month + 1} NĂM ${year}`,
      fixedCols: FIXED_COLS,
      dayCols: [],
      summaryCols: [],
      headerRowCount: 2,
      leftAlignDataCols: new Set([1, 2, 3, 4, 5]),
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
