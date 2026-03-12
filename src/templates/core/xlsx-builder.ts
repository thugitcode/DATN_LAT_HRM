import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

export interface SheetConfig {
  aoa: unknown[][];
  merges: XLSX.Range[];
  colWidths: number[];
  rowHeights?: number[];
  sheetName: string;
  applyStyles: (ws: XLSX.WorkSheet) => void;
}

/**
 * Generic builder — nhận config, trả về ws đã style.
 * Tất cả template excel đều dùng hàm này.
 */
export const buildSheet = (config: SheetConfig): XLSX.WorkSheet => {
  const ws = XLSX.utils.aoa_to_sheet(config.aoa);
  ws['!merges'] = config.merges;
  ws['!cols'] = config.colWidths.map((wch) => ({ wch }));
  if (config.rowHeights?.length) {
    ws['!rows'] = config.rowHeights.map((hpt) => (hpt ? { hpt } : {}));
  }
  config.applyStyles(ws);
  return ws;
};

export const writeWorkbook = (ws: XLSX.WorkSheet, sheetName: string, filename: string) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

/** Apply style to every cell in a range — tái sử dụng trong mọi template */
export const applyStyleToRange = (
  ws: XLSX.WorkSheet,
  getCellStyle: (r: number, c: number) => XLSX.CellStyle | null,
) => {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      const style = getCellStyle(R, C);
      if (style) ws[addr].s = style;
    }
  }
};
