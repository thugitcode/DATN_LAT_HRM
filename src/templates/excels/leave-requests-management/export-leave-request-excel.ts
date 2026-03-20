/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from '@/i18n';
import { dataStyle, headerStyle, stripedBg } from '@/templates/core/styles';
import {
  applyStyleToRange,
  buildSheet,
  writeWorkbook,
  type SheetConfig,
} from '@/templates/core/xlsx-builder';
import {
  applyFooterStyles,
  applyHeaderStyles,
  buildExcelFooterRows,
  buildFooterMerges,
  buildHeaderMerges,
  buildHeaderRows,
  type ExcelFooterConfig,
  type ExcelHeaderConfig,
} from '@/templates/shares/excel-header-footer';
import dayjs from 'dayjs';

import { formatDate } from '@/lib/utils';
import type { LeaveRequest } from '@/features/leave-management/leave-request-management/type';

const SHEET_NAME = 'Quản lý nghỉ phép';
const HEADER_BG = 'DBEAFE';
const LEFT_INFO_COLS = 3;
const ROW_BLANK = 2;
const ROW_HEADER = 3;
const ROW_DATA = 4;

const COL_WIDTHS = [22, 16, 22, 18, 20, 18, 18, 12, 28, 22, 22];
const TOTAL_COLS = COL_WIDTHS.length;

const t = (key: string, options?: object) =>
  i18n.t(`leave-management:${key}` as any, options as any);
const tts = (key: string) => i18n.t(`timekeeping-shift-scheduling:${key}` as any);
const resolveMonth = (month?: string) => {
  const parsed = month ? dayjs(month) : dayjs();
  return parsed.isValid() ? parsed : dayjs();
};

const buildColHeaderRow = (): string[] => [
  t('leave_request.columns.department'),
  t('leave_request.columns.staff_code'),
  t('leave_request.columns.staff_name'),
  t('leave_request.columns.position'),
  t('leave_request.columns.leave_type'),
  t('leave_request.columns.from_date'),
  t('leave_request.columns.to_date'),
  t('leave_request.columns.total_days'),
  t('leave_request.columns.reason'),
  t('leave_request.columns.replacement'),
  t('leave_request.columns.approved_by'),
];

const buildDataRow = (row: LeaveRequest): unknown[] => {
  const days = Number(row.totalDays);
  const display = days % 1 === 0 ? Math.floor(days) : days;

  const fromDate = [
    row.startTime ? row.startTime.slice(0, 5) : '',
    row.fromDate ? formatDate(row.fromDate) : '-',
  ]
    .filter(Boolean)
    .join(' ');

  const toDate = [
    row.endTime ? row.endTime.slice(0, 5) : '',
    row.toDate ? formatDate(row.toDate) : '-',
  ]
    .filter(Boolean)
    .join(' ');

  return [
    row.departments?.map((d) => d.name).join(', ') ?? '-',
    row.staffCode ?? '-',
    row.staffName ?? '-',
    tts(`staff_position.${row.staffPosition?.toLowerCase()}`) ?? '-',
    row.leaveReasonName ?? '-',
    fromDate,
    toDate,
    t('leave_request.columns.days_count', { count: display }),
    row.reason ?? '-',
    row.replacementStaffName ?? '-',
    row.approvedByName ?? '—',
  ];
};

const buildAoa = (
  data: LeaveRequest[],
  base: dayjs.Dayjs,
  companyName: string,
  unitName: string,
  departmentName: string,
): unknown[][] => {
  const headerCfg: ExcelHeaderConfig = {
    companyName,
    unitName,
    title: t('leave_request.title'),
    departmentName: departmentName,
    totalCols: TOTAL_COLS,
    leftInfoCols: LEFT_INFO_COLS,
  };

  const footerCfg: ExcelFooterConfig = { totalCols: TOTAL_COLS };

  const { row1, row2 } = buildHeaderRows(headerCfg);
  const { blankRow, dateRow, blankSignRow, signRow } = buildExcelFooterRows(footerCfg);

  return [
    row1,
    row2,
    Array(TOTAL_COLS).fill(''),
    buildColHeaderRow(),
    ...data.map(buildDataRow),
    Array(TOTAL_COLS).fill(''),
    Array(TOTAL_COLS).fill(''),
    Array(TOTAL_COLS).fill(''),
    Array(TOTAL_COLS).fill(''),
    blankRow,
    dateRow,
    blankSignRow,
    signRow,
  ];
};

const buildMerges = (dataLength: number) => {
  const footerOffset = ROW_DATA + dataLength + 4;
  return [
    ...buildHeaderMerges({ totalCols: TOTAL_COLS, leftInfoCols: LEFT_INFO_COLS }, 0),
    ...buildFooterMerges({ totalCols: TOTAL_COLS }, footerOffset),
  ];
};

const buildApplyStyles =
  (dataLength: number) => (ws: Parameters<SheetConfig['applyStyles']>[0]) => {
    const lastDataRow = ROW_DATA + dataLength - 1;
    const footerOffset = ROW_DATA + dataLength + 4;

    applyHeaderStyles(ws, { leftInfoCols: LEFT_INFO_COLS }, 0);
    applyStyleToRange(ws, (r, c) => {
      if (r === ROW_BLANK) return null;
      if (r === ROW_HEADER) return headerStyle(HEADER_BG);
      if (r >= ROW_DATA && r <= lastDataRow) {
        const isLeftAlign = c === 0 || c === 2 || c === 8 || c === 9 || c === 10;
        return dataStyle({ isLeft: isLeftAlign, bgRgb: stripedBg(r - ROW_DATA) });
      }
      return null;
    });
    applyFooterStyles(ws, footerOffset, TOTAL_COLS);
  };

export const exportLeaveRequestToExcel = (
  data: LeaveRequest[],
  month?: string,
  companyName = 'Bệnh viện đa khoa',
  unitName = 'TRUNG TÂM Y TẾ',
  departmentName = '',
) => {
  const base = resolveMonth(month);
  const dataLength = data.length;

  const config: SheetConfig = {
    aoa: buildAoa(data, base, companyName, unitName, departmentName),
    merges: buildMerges(dataLength),
    colWidths: COL_WIDTHS,
    rowHeights: [22, 18, 8, 36, ...Array(dataLength).fill(20), 12, 12, 12, 12, 8, 20, 8, 20],
    sheetName: SHEET_NAME,
    applyStyles: buildApplyStyles(dataLength),
  };

  const ws = buildSheet(config);
  writeWorkbook(ws, SHEET_NAME, `${SHEET_NAME}-${base.format('MM-YYYY')}.xlsx`);
};
