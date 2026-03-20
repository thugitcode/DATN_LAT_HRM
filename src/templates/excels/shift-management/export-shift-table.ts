import { getStaffPositionMap } from '@/templates/core/i18n';
import { _applyTableStyles } from '@/templates/core/styles';
import { buildSharedFooter, buildSharedHeader, DAY_SHORT, tx } from '@/templates/shares/shared';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import type { StaffSchedule } from '@/types';
import { getDaysInMonth, getWeeksInMonth } from '@/features/timekeeping-shift-scheduling/helper';

export const exportTableToExcel = (
  data: StaffSchedule[],
  year: number,
  month: number,
  departmentName = '',
) => {
  const days = getDaysInMonth(year, month);
  const weeks = getWeeksInMonth(year, month);
  const staffPos = getStaffPositionMap();

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

  const { rows: headerRows, merges: headerMerges } = buildSharedHeader(
    totalCols,
    FIXED_COL_COUNT,
    month,
    year,
    departmentName,
  );
  aoa.push(...headerRows);
  merges.push(...headerMerges);

  const row2: unknown[] = Array(FIXED_COL_COUNT).fill('');
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

  const row3: unknown[] = Array(FIXED_COL_COUNT).fill('');
  days.forEach((d) => row3.push(dayjs(d.date).date()));
  aoa.push(row3);

  aoa.push([
    tx('columns.stt'),
    tx('print.dept_room'),
    tx('print.employee_code_short'),
    tx('print.full_name'),
    tx('print.position'),
    ...days.map((d) => DAY_SHORT[d.dayOfWeek]),
  ]);

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
