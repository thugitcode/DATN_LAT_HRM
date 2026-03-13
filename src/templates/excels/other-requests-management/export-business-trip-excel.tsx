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

import type { BusinessTrip } from '@/features/other-requests-management/types/business-trip.type';

// ─── Constants ────────────────────────────────────────────────────────────────

const SHEET_NAME = 'Quản lý công tác';
const HEADER_BG = 'DBEAFE';
const LEFT_INFO_COLS = 3; // A–C: Phòng ban | Mã NV | Họ tên → phần trái của header

// Fixed row indices
const ROW_COMPANY = 0; // Tên công ty (trái) | Tiêu đề bảng (phải)
const ROW_UNIT = 1; // Tên bệnh viện (trái) | Tên khoa (phải)
const ROW_BLANK = 2;
const ROW_HEADER = 3; // Column headers
const ROW_DATA = 4; // Data bắt đầu từ đây

// Col widths theo thứ tự columns (13 cols)
// department | staffCode | staffName | overtimeType | overtimeDate | trainingDate
// startTime  | endTime   | totalTime | trainingLocation | reason | directManager | status
const COL_WIDTHS = [22, 16, 22, 20, 16, 16, 12, 12, 12, 22, 28, 22, 14];
const TOTAL_COLS = COL_WIDTHS.length; // 13

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BuildBusinessTripExcelOptions {
  data: BusinessTrip[];
  month?: string; // 'YYYY-MM' — nếu không có thì lấy tháng hiện tại
  companyName: string; // Tên công ty – động
  unitName: string; // Tên bệnh viện/đơn vị – động
  departmentName?: string;
  t: (key: string, options?: object) => string;
}

// ─── Column header row ────────────────────────────────────────────────────────

const buildColHeaderRow = (t: (key: string) => string): string[] => [
  t('columns.department'),
  t('columns.staffCode'),
  t('columns.staffName'),
  t('columns.overtimeType'),
  t('columns.overtimeDate'),
  t('columns.trainingDate'),
  t('columns.startTime'),
  t('columns.endTime'),
  t('columns.totalTime'),
  t('columns.trainingLocation'),
  t('columns.reason'),
  t('columns.directManager'),
  t('columns.status'),
];

// ─── Data row ─────────────────────────────────────────────────────────────────

const buildDataRow = (row: BusinessTrip): unknown[] => [
  row.department ?? '-',
  row.staffCode ?? '-',
  row.staffName ?? '-',
  row.type ?? '-',
  row.overtimeDate ?? '-',
  row.trainingDate ?? '-',
  row.startTime ?? '-',
  row.endTime ?? '-',
  row.totalTime ?? '-',
  row.trainingLocation ?? '-',
  row.content ?? '-',
  row.approvedByName ?? '-',
  row.status ?? '-',
];

// ─── AOA ──────────────────────────────────────────────────────────────────────

const buildAoa = (
  data: BusinessTrip[],
  month: string | undefined,
  companyName: string,
  unitName: string,
  departmentName: string,
  t: (key: string, options?: object) => string,
): unknown[][] => {
  // Fallback về hiện tại nếu month rỗng hoặc không hợp lệ
  const parsed = month ? dayjs(month) : dayjs();
  const base = parsed.isValid() ? parsed : dayjs();
  const year = base.year();
  const monthLabel = base.format('MM/YYYY');

  // ── Header (rows 0–1) ──────────────────────────────────────────────────────
  const headerCfg: ExcelHeaderConfig = {
    companyName,
    unitName,
    title: t('businessTripManagement.title'),
    // departmentName ở row2 phía phải — hiển thị tên khoa hoặc tháng
    departmentName: departmentName || t('print.subtitle_month', { month: monthLabel }),
    totalCols: TOTAL_COLS,
    leftInfoCols: LEFT_INFO_COLS,
  };

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerCfg: ExcelFooterConfig = {
    year,
    totalCols: TOTAL_COLS,
    // col 9 (trainingLocation) trở đi — tránh đè lên sig2 merge, "Lập Bảng" nằm nửa phải
    dateColStart: 9,
    labels: {
      // Build trực tiếp, không phụ thuộc i18n interpolation có thể trả NaN
      footerDate: `….............., ngày __ tháng __ năm ${year}`,
      unitHead: t('print.footer_unit_head'),
      hr: t('print.footer_hr'),
      preparedBy: t('print.footer_prepared_by'),
    },
  };

  const { row1, row2 } = buildHeaderRows(headerCfg);
  const { blankRow, dateRow, blankSignRow, signRow } = buildExcelFooterRows(footerCfg);

  return [
    row1, // ROW_COMPANY = 0
    row2, // ROW_UNIT    = 1
    Array(TOTAL_COLS).fill(''), // ROW_BLANK   = 2
    buildColHeaderRow(t), // ROW_HEADER  = 3
    ...data.map(buildDataRow), // ROW_DATA    = 4+
    Array(TOTAL_COLS).fill(''), // spacer 1
    Array(TOTAL_COLS).fill(''), // spacer 2
    Array(TOTAL_COLS).fill(''), // spacer 3
    Array(TOTAL_COLS).fill(''), // spacer 4
    blankRow,
    dateRow,
    blankSignRow,
    signRow,
  ];
};

// ─── Merges ───────────────────────────────────────────────────────────────────

const buildMerges = (dataLength: number) => {
  const footerOffset = ROW_DATA + dataLength + 4; // +4 spacer rows

  return [
    // Rows 0–1: trái (company/unit) + phải (title/department)
    ...buildHeaderMerges({ totalCols: TOTAL_COLS, leftInfoCols: LEFT_INFO_COLS }, ROW_COMPANY),
    // Footer: date (nửa phải) + 3 cụm chữ ký
    ...buildFooterMerges({ totalCols: TOTAL_COLS }, footerOffset),
  ];
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const buildApplyStyles =
  (dataLength: number) => (ws: Parameters<SheetConfig['applyStyles']>[0]) => {
    const lastDataRow = ROW_DATA + dataLength - 1;
    const footerOffset = ROW_DATA + dataLength + 4;

    // Rows 0–1: company / unit header
    applyHeaderStyles(ws, { leftInfoCols: LEFT_INFO_COLS }, ROW_COMPANY);

    // Rows 2–lastData: blank / col-header / data
    applyStyleToRange(ws, (r, c) => {
      if (r === ROW_BLANK) return null;

      if (r === ROW_HEADER) return headerStyle(HEADER_BG);

      if (r >= ROW_DATA && r <= lastDataRow) {
        // left-align: department(0), staffName(2), trainingLocation(9), reason(10), directManager(11)
        const isLeftAlign = c === 0 || c === 2 || c === 9 || c === 10 || c === 11;
        return dataStyle({ isLeft: isLeftAlign, bgRgb: stripedBg(r - ROW_DATA) });
      }

      return null;
    });

    // Footer rows: date + sign
    applyFooterStyles(ws, footerOffset, TOTAL_COLS);
  };

// ─── Public API ───────────────────────────────────────────────────────────────

export const buildBusinessTripSheet = ({
  data,
  month,
  companyName,
  unitName,
  departmentName = '',
  t,
}: BuildBusinessTripExcelOptions) => {
  const dataLength = data.length;

  const config: SheetConfig = {
    aoa: buildAoa(data, month, companyName, unitName, departmentName, t),
    merges: buildMerges(dataLength),
    colWidths: COL_WIDTHS,
    rowHeights: [
      22, // row 0: company / title
      18, // row 1: unit / department
      8, // row 2: blank
      36, // row 3: col header
      ...Array(dataLength).fill(20), // data rows
      12,
      12,
      12,
      12, // spacer x4
      8, // footer blank
      20, // footer date
      8, // footer blank sign
      20, // footer sign
    ],
    sheetName: SHEET_NAME,
    applyStyles: buildApplyStyles(dataLength),
  };

  return buildSheet(config);
};

export const exportBusinessTripExcel = (opts: BuildBusinessTripExcelOptions) => {
  const ws = buildBusinessTripSheet(opts);
  writeWorkbook(ws, SHEET_NAME, `business-trip-${opts.month}.xlsx`);
};
