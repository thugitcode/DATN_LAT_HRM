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
  title: {
    alignment: CENTER,
    border: BORDER,
    fill: { fgColor: { rgb: '374151' } },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
  },
  week: {
    alignment: CENTER,
    border: BORDER,
    fill: { fgColor: { rgb: '6B7280' } },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
  },
  col: {
    alignment: CENTER,
    border: BORDER,
    fill: { fgColor: { rgb: '9CA3AF' } },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
  },
} as const;

export const ROW_FILL = {
  even: 'FFFFFF',
  odd: 'F9FAFB',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColDef {
  label: string;
  wch: number;
  align?: 'left' | 'center';
}

export interface ExcelSheetConfig {
  /** Sheet title shown in row 0 */
  title: string;
  /** Fixed column definitions (left side) */
  fixedCols: ColDef[];
  /** Day/date columns (middle) */
  dayCols: ColDef[];
  /** Optional summary columns (right side) */
  summaryCols?: ColDef[];
  /** Optional week-grouping header row (between title and col header) */
  weekRows?: { label: string; span: number }[];
  /** How many header rows before data starts */
  headerRowCount: number;
  /** Which column indices (0-based) should be left-aligned in data rows */
  leftAlignDataCols: Set<number>;
  /** Row height for title row in pt */
  titleRowHeight?: number;
}

export interface DataRow {
  cells: unknown[];
  /** Rows to merge downward from this row (for grouped rows) */
  mergeDown?: number;
  /** If true, this row is a continuation of the group above (skip fixed-col data) */
  isContinuation?: boolean;
}

export interface SheetData {
  config: ExcelSheetConfig;
  /** Header rows after title (week row + col header row) already built */
  extraHeaderRows: unknown[][];
  /** Extra merges for header rows */
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
  const merges: XLSX.Range[] = [];

  // ── Row 0: Title ─────────────────────────────────────────────────────────
  const titleRow: unknown[] = [config.title];
  for (let i = 1; i < totalCols; i++) titleRow.push('');
  aoa.push(titleRow);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  // ── Extra header rows (weeks, col labels, etc.) ───────────────────────────
  extraHeaderRows.forEach((row) => aoa.push(row));
  extraHeaderMerges.forEach((m) => merges.push(m));

  // ── Data rows ─────────────────────────────────────────────────────────────
  rows.forEach((row) => aoa.push(row.cells));

  // ── Merges for grouped staff rows ─────────────────────────────────────────
  staffGroups.forEach(({ startRow, rowCount }) => {
    if (rowCount <= 1) return;
    // Merge fixed cols downward (caller decides which cols to merge)
  });

  // ── Build worksheet ───────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = [...merges, ...sheetData.extraHeaderMerges];
  ws['!cols'] = [
    ...fixedCols.map((c) => ({ wch: c.wch })),
    ...dayCols.map((c) => ({ wch: c.wch })),
    ...summaryCols.map((c) => ({ wch: c.wch })),
  ];
  ws['!rows'] = [{ hpt: config.titleRowHeight ?? 40 }];

  // ── Apply cell styles ─────────────────────────────────────────────────────
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };

      ws[addr].s = getCellStyle(R, C, headerRowCount, staffGroups, config);
    }
  }

  return ws;
}

function getCellStyle(
  R: number,
  C: number,
  headerRowCount: number,
  staffGroups: { startRow: number; rowCount: number }[],
  config: ExcelSheetConfig,
): object {
  if (R === 0) return HEADER_STYLES.title;

  if (R < headerRowCount - 1) return HEADER_STYLES.week;

  if (R === headerRowCount - 1) return HEADER_STYLES.col;

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
