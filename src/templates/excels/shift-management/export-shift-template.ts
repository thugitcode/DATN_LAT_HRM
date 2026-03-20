import { _applyTemplateStyles } from '@/templates/core/styles';
import {
  buildSharedFooter,
  buildSharedHeader,
  DAY_SHORT,
  getStaffPositionMap,
  tx,
} from '@/templates/shares/shared';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import type { Staff } from '@/types/shift-management.type';
import { getDaysInMonth } from '@/features/timekeeping-shift-scheduling/helper';

export const exportTemplateToExcel = (data: Staff[], year: number, month: number) => {
  const days = getDaysInMonth(year, month);
  const staffPos = getStaffPositionMap();
  const FIXED_COL_COUNT = 5;
  const totalCols = FIXED_COL_COUNT + days.length;
  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  const { rows: headerRows, merges: headerMerges } = buildSharedHeader(
    totalCols,
    FIXED_COL_COUNT,
    month,
    year,
    '',
  );
  aoa.push(...headerRows);
  merges.push(...headerMerges);

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
  const { rows: footerRows, merges: footerMerges } = buildSharedFooter(totalCols, lastDataRow);
  aoa.push(...footerRows);
  merges.push(...footerMerges);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: aoa.length - 1, c: totalCols - 1 },
  });
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
