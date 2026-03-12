import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

// ─── Shared style tokens ──────────────────────────────────────────────────────

export const BORDER = {
  top: { style: 'thin', color: { rgb: 'D1D5DB' } },
  bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
  left: { style: 'thin', color: { rgb: 'D1D5DB' } },
  right: { style: 'thin', color: { rgb: 'D1D5DB' } },
} as const;

export const CENTER = { horizontal: 'center', vertical: 'center', wrapText: true } as const;
export const LEFT = { horizontal: 'left', vertical: 'center', wrapText: true } as const;

export const HEADER_STYLES = {
  // Row 0: company name left + title center — no border/fill
  companyLeft: {
    alignment: LEFT,
    font: { bold: true, sz: 11 },
  },
  companyCenter: {
    alignment: CENTER,
    font: { bold: true, sz: 11 },
  },
  // Row 1: same treatment as row 0
  deptLeft: {
    alignment: LEFT,
    font: { bold: true, sz: 11 },
  },
  deptCenter: {
    alignment: CENTER,
    font: { bold: true, sz: 11 },
  },
  // Week grouping row (e.g. "TUẦN 1: 1/1 - 7/1")
  week: {
    alignment: CENTER,
    border: BORDER,
    fill: { fgColor: { rgb: 'BFDBFE' } },
    font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
  },
  // Day-of-week number row (if present)
  dayNumber: {
    alignment: CENTER,
    border: BORDER,
    fill: { fgColor: { rgb: '93C5FD' } },
    font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
  },
  // Column label row
  col: {
    alignment: CENTER,
    border: BORDER,
    fill: { fgColor: { rgb: 'DBEAFE' } },
    font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
  },
} as const;

export const ROW_FILL = {
  even: 'FFFFFF',
  odd: 'EFF6FF', // matches useShiftExport
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColDef {
  label: string;
  wch: number;
  align?: 'left' | 'center';
}

export interface ExcelSheetConfig {
  /** Sheet title text (used in row 1, col 3) */
  title: string;
  /** Company name line 1 (row 0 left) */
  companyName1?: string;
  /** Company name line 2 (row 1 left) */
  companyName2?: string;
  /** Department name shown in row 1 right */
  departmentName?: string;
  /** Fixed column definitions (left side) */
  fixedCols: ColDef[];
  /** Day/date columns (middle) */
  dayCols: ColDef[];
  /** Optional summary columns (right side) */
  summaryCols?: ColDef[];
  /**
   * How many header rows before data starts.
   * Layout (0-indexed):
   *   0 → company/title row  (no border)
   *   1 → dept/subtitle row  (no border)
   *   2 → week grouping row  (BFDBFE)
   *   3 → col header row     (DBEAFE)
   *
   * For grid layout (no week row): headerRowCount = 3
   * For list layout (with week row): headerRowCount = 4
   */
  headerRowCount: number;
  /** Which column indices (0-based) should be left-aligned in data rows */
  leftAlignDataCols: Set<number>;
  /** Row height for company/title rows in pt */
  titleRowHeight?: number;
  /** Year used in footer signature date line */
  year?: number;
}

export interface DataRow {
  cells: unknown[];
  isContinuation?: boolean;
}

export interface SheetData {
  config: ExcelSheetConfig;
  /** Header rows after the 2 company rows (week row + col header row) already built */
  extraHeaderRows: unknown[][];
  /** Extra merges for all header rows (including company row merges) */
  extraHeaderMerges: XLSX.Range[];
  /** Data rows */
  rows: DataRow[];
  /** Staff group info for alternating row colors */
  staffGroups: { startRow: number; rowCount: number }[];
}

// ─── Core builder ─────────────────────────────────────────────────────────────

export function buildSheet(sheetData: SheetData): XLSX.WorkSheet {
  const { config, extraHeaderRows, extraHeaderMerges, rows, staffGroups } = sheetData;
  const { fixedCols, dayCols, summaryCols = [], headerRowCount } = config;

  const totalCols = fixedCols.length + dayCols.length + summaryCols.length;
  const aoa: unknown[][] = [];

  // ── Row 0: Company name 1 (left) + Title (center) ────────────────────────
  const companyRow1: unknown[] = [
    config.companyName1 ?? '',
    '',
    '',
    config.title,
    ...Array(totalCols - 4).fill(''),
  ];
  aoa.push(companyRow1);

  // ── Row 1: Company name 2 (left) + Department (center) ───────────────────
  const deptLabel = config.departmentName ? `Khoa/Phòng: ${config.departmentName}` : 'Khoa/Phòng:';
  const companyRow2: unknown[] = [
    config.companyName2 ?? '',
    '',
    '',
    deptLabel,
    ...Array(totalCols - 4).fill(''),
  ];
  aoa.push(companyRow2);

  // ── Extra header rows (week row, col header row, etc.) ────────────────────
  extraHeaderRows.forEach((row) => aoa.push(row));

  // ── Data rows ─────────────────────────────────────────────────────────────
  rows.forEach((row) => aoa.push(row.cells));

  // ── Footer rows ───────────────────────────────────────────────────────────
  const footerRows = buildFooterRows(totalCols, config.year);
  footerRows.forEach((row) => aoa.push(row));

  // ── Build worksheet ───────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Merges: company row merges + all extra merges
  const companyMerges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 1, c: 3 }, e: { r: 1, c: totalCols - 1 } },
  ];
  ws['!merges'] = [...companyMerges, ...extraHeaderMerges];

  ws['!cols'] = [
    ...fixedCols.map((c) => ({ wch: c.wch })),
    ...dayCols.map((c) => ({ wch: c.wch })),
    ...summaryCols.map((c) => ({ wch: c.wch })),
  ];
  ws['!rows'] = [{ hpt: config.titleRowHeight ?? 20 }, { hpt: config.titleRowHeight ?? 20 }];

  // ── Apply cell styles ─────────────────────────────────────────────────────
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  const lastDataRow = 2 + extraHeaderRows.length + rows.length - 1; // last data row index

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      ws[addr].s = getCellStyle(R, C, headerRowCount, lastDataRow, staffGroups, config);
    }
  }

  return ws;
}

function getCellStyle(
  R: number,
  C: number,
  headerRowCount: number,
  lastDataRow: number,
  staffGroups: { startRow: number; rowCount: number }[],
  config: ExcelSheetConfig,
): object {
  // Row 0: company name row — no border/fill
  if (R === 0) {
    return C < 3 ? HEADER_STYLES.companyLeft : HEADER_STYLES.companyCenter;
  }

  // Row 1: dept/subtitle row — no border/fill
  if (R === 1) {
    return C < 3 ? HEADER_STYLES.deptLeft : HEADER_STYLES.deptCenter;
  }

  // Footer rows (after last data row)
  if (R > lastDataRow) {
    return { alignment: CENTER, font: { sz: 10 } };
  }

  // Header rows 2..headerRowCount-1
  // headerRowCount includes the 2 company rows, so actual header band is rows 2..headerRowCount-1
  if (R < headerRowCount) {
    // Last header row = col label row
    if (R === headerRowCount - 1) return HEADER_STYLES.col;
    // Second-to-last = day number row (if headerRowCount === 4, this is row 2)
    if (headerRowCount === 4 && R === 2) return HEADER_STYLES.week;
    if (headerRowCount === 5 && R === 2) return HEADER_STYLES.week;
    if (headerRowCount === 5 && R === 3) return HEADER_STYLES.dayNumber;
    // fallback
    return HEADER_STYLES.week;
  }

  // Data row
  const groupIdx = staffGroups.reduce((acc, g, i) => (R >= g.startRow ? i : acc), 0);
  const isEven = groupIdx % 2 === 0;
  const isLeft = config.leftAlignDataCols.has(C);

  return {
    alignment: isLeft ? LEFT : CENTER,
    border: BORDER,
    fill: { fgColor: { rgb: isEven ? ROW_FILL.even : ROW_FILL.odd } },
    font: { sz: 10 },
  };
}

// ─── Footer builder ───────────────────────────────────────────────────────────

function buildFooterRows(totalCols: number, year?: number): unknown[][] {
  const dateOffset = Math.floor(totalCols * 0.45);
  const col1 = Math.floor(totalCols * 0.05);
  const col2 = Math.floor(totalCols * 0.38);
  const col3 = dateOffset + 2;

  const footerDateRow: unknown[] = Array(totalCols).fill('');
  footerDateRow[dateOffset] = year
    ? `Năm ${year}, ngày ... tháng ... năm ...`
    : 'Ngày ... tháng ... năm ...';

  const footerSignRow: unknown[] = Array(totalCols).fill('');
  footerSignRow[col1] = 'Trưởng đơn vị';
  footerSignRow[col2] = 'Phòng TCCB';
  footerSignRow[col3] = 'Người lập biểu';

  // Empty rows for spacing + name lines
  return [
    Array(totalCols).fill(''), // spacing
    Array(totalCols).fill(''), // spacing
    Array(totalCols).fill(''), // spacing
    footerDateRow,
    Array(totalCols).fill(''), // spacing below date
    footerSignRow,
  ];
}

// ─── Write helper ─────────────────────────────────────────────────────────────

export function writeWorkbook(ws: XLSX.WorkSheet, sheetName: string, filename: string) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

// ─── Day/week helpers re-exported for convenience ─────────────────────────────

export const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

export function formatDate(year: number, month: number, day: number) {
  return dayjs(new Date(year, month, day)).format('YYYY-MM-DD');
}

export function formatDateLabel(year: number, month: number, day: number) {
  return dayjs(new Date(year, month, day)).format('D/M/YY');
}
