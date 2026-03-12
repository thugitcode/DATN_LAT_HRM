import type * as XLSX from 'xlsx-js-style';

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
