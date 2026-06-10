import * as XLSX from 'xlsx-js-style';
import * as XLSX from 'xlsx-js-style';

// ── Primitives ────────────────────────────────────────────────────────────────
export const BORDER: XLSX.BorderStyle = {
  top: { style: 'thin', color: { rgb: 'D1D5DB' } },
  bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
  left: { style: 'thin', color: { rgb: 'D1D5DB' } },
  right: { style: 'thin', color: { rgb: 'D1D5DB' } },
};

export const ALIGN = {
  center: { horizontal: 'center', vertical: 'center', wrapText: true },
  left: { horizontal: 'left', vertical: 'center', wrapText: true },
} as const;

export const headerStyle = (bgRgb: string) => ({
  alignment: ALIGN.center,
  border: BORDER,
  fill: { fgColor: { rgb: bgRgb } },
  font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
});

export const titleStyle = (alignLeft = false) => ({
  alignment: alignLeft ? ALIGN.left : ALIGN.center,
  font: { bold: true, sz: 11 },
});

export const dataStyle = (opts: { isLeft?: boolean; bgRgb?: string }) => ({
  alignment: opts.isLeft ? ALIGN.left : ALIGN.center,
  border: BORDER,
  fill: { fgColor: { rgb: opts.bgRgb ?? 'FFFFFF' } },
  font: { sz: 10 },
});

export const footerStyle = () => ({
  alignment: ALIGN.center,
  font: { sz: 10 },
});

export const stripedBg = (idx: number, evenRgb = 'FFFFFF', oddRgb = 'EFF6FF') =>
  idx % 2 === 0 ? evenRgb : oddRgb;

export const border = {
  top: { style: 'thin', color: { rgb: 'D1D5DB' } },
  bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
  left: { style: 'thin', color: { rgb: 'D1D5DB' } },
  right: { style: 'thin', color: { rgb: 'D1D5DB' } },
};
export const centerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true };
export const leftAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };

export const _applyTableStyles = (
  ws: XLSX.WorkSheet,
  lastDataRow: number,
  fixedCols: number,
  staffRowStart: number[],
) => {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      if (R > lastDataRow) {
        ws[addr].s = { alignment: centerAlignment, font: { sz: 10 } };
        continue;
      }
      if (R <= 1)
        ws[addr].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
      else if (R === 2)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'BFDBFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 3)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '93C5FD' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 4)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else {
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        const isDateCol = C >= fixedCols;
        ws[addr].s = {
          alignment: C > 0 && C < fixedCols ? leftAlignment : centerAlignment,
          border,
          fill: {
            fgColor: { rgb: isDateCol ? 'FFFFFF' : staffIdx % 2 === 0 ? 'FFFFFF' : 'EFF6FF' },
          },
          font: { sz: 10 },
        };
      }
    }
  }
};

export const _applyGridStyles = (
  ws: XLSX.WorkSheet,
  lastDataRow: number,
  fixedCols: number,
  staffRowStart: number[],
) => {
  const leftAlignCols = new Set([1, 2, 3, 4, 5]);
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      if (R > lastDataRow) {
        ws[addr].s = { alignment: centerAlignment, font: { sz: 10 } };
        continue;
      }
      if (R <= 1)
        ws[addr].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
      else if (R === 2)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '93C5FD' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 3)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else {
        const isLeft = R >= 4 && leftAlignCols.has(C);
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        ws[addr].s = {
          alignment: isLeft ? leftAlignment : centerAlignment,
          border,
          fill: { fgColor: { rgb: staffIdx % 2 === 0 ? 'FFFFFF' : 'F9FAFB' } },
          font: { sz: 10 },
        };
      }
    }
  }
};

export const _applyTemplateStyles = (
  ws: XLSX.WorkSheet,
  lastDataRow: number,
  fixedCols: number,
  staffRowStart: number[],
) => {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      if (R > lastDataRow) {
        ws[addr].s = { alignment: centerAlignment, font: { sz: 10 } };
        continue;
      }
      if (R <= 1)
        ws[addr].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
      else if (R === 2)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'BFDBFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 3)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: '93C5FD' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else if (R === 4)
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
      else {
        const staffIdx = staffRowStart.reduce((acc, start, i) => (R >= start ? i : acc), 0);
        const isDateCol = C >= fixedCols;
        ws[addr].s = {
          alignment: C < fixedCols && C > 0 ? leftAlignment : centerAlignment,
          border,
          fill: {
            fgColor: { rgb: isDateCol ? 'FFFFFF' : staffIdx % 2 === 0 ? 'FFFFFF' : 'EFF6FF' },
          },
          font: { sz: 10 },
        };
      }
    }
  }
};
