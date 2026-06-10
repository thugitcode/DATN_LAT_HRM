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

import { toDDMMYYYY, toHHMM } from '@/lib/utils';
import { RequestAttendanceTypeLabel } from '@/features/other-requests-management/constants/constants';
import type { ExportFn } from '@/features/other-requests-management/core/types/request-management.types';
import type { GeneralRequest } from '@/features/other-requests-management/types/generate-request.type';

const SHEET_NAME = 'Quản lý làm việc từ xa';
const HEADER_BG = 'DBEAFE';
const LEFT_INFO_COLS = 3;
const ROW_BLANK = 2;
const ROW_HEADER = 3;
const ROW_DATA = 4;

const COL_WIDTHS = [22, 16, 22, 20, 16, 12, 12, 12, 28, 22, 14];
const TOTAL_COLS = COL_WIDTHS.length;

const resolveMonth = (month?: string) => {
  const parsed = month ? dayjs(month) : dayjs();
  return parsed.isValid() ? parsed : dayjs();
};

const buildColHeaderRow = (t: (key: string) => string): string[] => [
  t('columns.department'),
  t('columns.staffCode'),
  t('columns.staffName'),
  t('columns.type'),
  t('columns.remoteDate'),
  t('columns.startTime'),
  t('columns.endTime'),
  t('columns.totalTime'),
  t('columns.reason'),
  t('columns.directManager'),
  t('columns.status'),
];

const buildDataRow = (row: GeneralRequest): unknown[] => [
  row.departments?.map((d) => d.name).join(', ') ?? '-',
  row.staffCode ?? '-',
  row.staffName ?? '-',
  RequestAttendanceTypeLabel?.[row.requestType] ?? '-',
  row.fromDate ? toDDMMYYYY(row.fromDate) : '-',
  row.startTime ? toHHMM(row.startTime) : '-',
  row.endTime ? toHHMM(row.endTime) : '-',
  row.totalHours ? `${Number(row.totalHours).toFixed()}` : '-',
  row.reason ?? '-',
  row.managerNames?.join(', ') ?? '-',
  row.status ? i18n.t(`common:status.${row.status.toLowerCase()}` as any) : '-',
];

const buildAoa = (
  data: GeneralRequest[],
  base: dayjs.Dayjs,
  companyName: string,
  unitName: string,
  departmentName: string,
  t: (key: string, options?: object) => string,
): unknown[][] => {
  const headerCfg: ExcelHeaderConfig = {
    companyName,
    unitName,
    title: t('remoteManagement.title'),
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
    buildColHeaderRow(t),
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
        const isLeftAlign = c === 0 || c === 2 || c === 8 || c === 9;
        return dataStyle({ isLeft: isLeftAlign, bgRgb: stripedBg(r - ROW_DATA) });
      }
      return null;
    });
    applyFooterStyles(ws, footerOffset, TOTAL_COLS);
  };

export const exportRemoteWorkExcel: ExportFn = ({
  data,
  month,
  companyName,
  unitName,
  departmentName = '',
  t,
}) => {
  const base = resolveMonth(month);
  const dataLength = data.length;

  const config: SheetConfig = {
    aoa: buildAoa(data, base, companyName, unitName, departmentName, t),
    merges: buildMerges(dataLength),
    colWidths: COL_WIDTHS,
    rowHeights: [22, 18, 8, 36, ...Array(dataLength).fill(20), 12, 12, 12, 12, 8, 20, 8, 20],
    sheetName: SHEET_NAME,
    applyStyles: buildApplyStyles(dataLength),
  };

  const ws = buildSheet(config);
  writeWorkbook(ws, SHEET_NAME, `${SHEET_NAME} ${base.format('MM-YYYY')}.xlsx`);
};
