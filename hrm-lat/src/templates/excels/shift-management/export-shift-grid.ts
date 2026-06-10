import { _applyGridStyles } from '@/templates/core/styles';
import {
  buildSharedFooter,
  buildSharedHeader,
  DAY_SHORT,
  getStaffPositionMap,
  tx,
} from '@/templates/shares/shared';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import type { StaffSchedule } from '@/types';
import { getDaysInMonth } from '@/features/timekeeping-shift-scheduling/helper';

export const exportGridToExcel = (
  data: StaffSchedule[],
  year: number,
  month: number,
  departmentName = '',
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

  const { rows: headerRows, merges: headerMerges } = buildSharedHeader(
    totalCols,
    FIXED_COL_COUNT,
    month,
    year,
    departmentName,
  );
  aoa.push(...headerRows);
  merges.push(...headerMerges);

  aoa.push(['', '', '', '', '', '', ...days.map((d) => dayjs(d.date).date())]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: FIXED_COL_COUNT - 1 } });

  aoa.push([
    tx('columns.stt'),
    tx('print.employee_code_short'),
    tx('print.full_name'),
    'Khoa',
    'Phòng',
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
  const { rows: footerRows, merges: footerMerges } = buildSharedFooter(totalCols, lastDataRow);
  aoa.push(...footerRows);
  merges.push(...footerMerges);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: aoa.length - 1, c: totalCols - 1 },
  });
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
