import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

export interface ExcelHeaderConfig {
  companyName: string;
  unitName: string;
  title: string;
  departmentName?: string;
  totalCols: number;
  leftInfoCols?: number;
}

export interface ExcelFooterConfig {
  totalCols: number;

  // dateColStart?: number;
  // labels: {
  //   footerDate: string;
  //   unitHead: string;
  //   hr: string;
  //   preparedBy: string;
  // };
}

export interface HeaderRows {
  row1: unknown[];
  row2: unknown[];
}

export interface FooterRows {
  blankRow: unknown[];
  dateRow: unknown[];
  blankSignRow: unknown[];
  signRow: unknown[];
}

export const buildHeaderMerges = (
  cfg: Pick<ExcelHeaderConfig, 'totalCols' | 'leftInfoCols'>,
  rowOffset = 0,
): XLSX.Range[] => {
  const split = (cfg.leftInfoCols ?? 4) - 1;
  const end = cfg.totalCols - 1;

  return [
    { s: { r: rowOffset, c: 0 }, e: { r: rowOffset, c: split } },
    { s: { r: rowOffset, c: split + 1 }, e: { r: rowOffset, c: end } },
    { s: { r: rowOffset + 1, c: 0 }, e: { r: rowOffset + 1, c: split } },
    { s: { r: rowOffset + 1, c: split + 1 }, e: { r: rowOffset + 1, c: end } },
  ];
};

export const buildHeaderRows = (cfg: ExcelHeaderConfig): HeaderRows => {
  const { companyName, unitName, title, departmentName = '', totalCols, leftInfoCols = 4 } = cfg;

  const row1: unknown[] = Array(totalCols).fill(null);
  row1[0] = companyName;
  row1[leftInfoCols] = title;

  const row2: unknown[] = Array(totalCols).fill(null);
  row2[0] = unitName;
  row2[leftInfoCols] = departmentName;

  return { row1, row2 };
};

export const applyHeaderStyles = (
  ws: XLSX.WorkSheet,
  cfg: Pick<ExcelHeaderConfig, 'leftInfoCols'>,
  rowOffset = 0,
) => {
  const split = cfg.leftInfoCols ?? 4;

  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');

  for (let R = rowOffset; R <= rowOffset + 1; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };

      const isLeft = C < split;
      ws[addr].s = {
        font: { bold: true, sz: 11, name: 'Calibri' },
        alignment: {
          horizontal: isLeft ? 'left' : 'center',
          vertical: 'center',
          wrapText: true,
        },
      };
    }
  }
};

export const buildExcelFooterRows = (cfg: ExcelFooterConfig): FooterRows => {
  const { totalCols } = cfg;
  const dateStart = Math.floor(totalCols * 0.6);
  const year = dayjs().year();

  const sig1Col = 0;
  const sig2Col = Math.floor(totalCols / 3);
  const sig3Col = dateStart;

  const blankRow: unknown[] = Array(totalCols).fill('');
  const blankSignRow: unknown[] = Array(totalCols).fill('');

  const dateRow: unknown[] = Array(totalCols).fill('');
  dateRow[dateStart] = `….............., ngày __ tháng __ năm ${year}`;

  const signRow: unknown[] = Array(totalCols).fill('');
  signRow[sig1Col] = 'Trưởng Đơn Vị';
  signRow[sig2Col] = 'TL. Hành chánh - Nhân sự';
  signRow[sig3Col] = 'Lập Bảng';

  return { blankRow, dateRow, blankSignRow, signRow };
};

export const buildFooterMerges = (
  cfg: Pick<ExcelFooterConfig, 'totalCols'>,
  rowOffset: number,
): XLSX.Range[] => {
  const { totalCols } = cfg;
  const end = totalCols - 1;
  const dateStart = Math.floor(totalCols * 0.6);

  const sig1End = Math.floor(totalCols / 3) - 1;
  const sig2Start = Math.floor(totalCols / 3);
  const sig2End = dateStart - 1;
  const sig3Start = dateStart;

  const dateRow = rowOffset + 1;
  const signRow = rowOffset + 3;

  return [
    { s: { r: dateRow, c: dateStart }, e: { r: dateRow, c: end } },
    { s: { r: signRow, c: 0 }, e: { r: signRow, c: sig1End } },
    { s: { r: signRow, c: sig2Start }, e: { r: signRow, c: sig2End } },
    { s: { r: signRow, c: sig3Start }, e: { r: signRow, c: end } },
  ];
};

export const applyFooterStyles = (ws: XLSX.WorkSheet, rowOffset: number, totalCols: number) => {
  const dateRow = rowOffset + 1;
  const signRow = rowOffset + 3;

  for (let C = 0; C < totalCols; C++) {
    for (const R of [dateRow, signRow]) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };

      ws[addr].s = {
        font: {
          bold: R === signRow,
          sz: 10,
          name: 'Times New Roman',
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        },
      };
    }
  }
};
