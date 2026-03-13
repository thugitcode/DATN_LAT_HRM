import * as XLSX from 'xlsx-js-style';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExcelHeaderConfig {
  /** Tên công ty – hiển thị bên trái row 1  */
  companyName: string;
  /** Tên bệnh viện / đơn vị – hiển thị bên trái row 2 */
  unitName: string;
  /** Tiêu đề bảng – hiển thị giữa row 1 */
  title: string;
  /** Tên khoa / phòng – hiển thị giữa row 2 */
  departmentName?: string;
  /** Tổng số cột của sheet */
  totalCols: number;
  /**
   * Số cột dành cho info bên trái (STT, Mã NV, Họ tên …).
   * Phần còn lại là vùng nội dung chính.
   * @default 4
   */
  leftInfoCols?: number;
}

export interface ExcelFooterConfig {
  year: number;
  /** Tổng số cột của sheet */
  totalCols: number;
  /**
   * Col index (0-based) bắt đầu text ngày tháng.
   * @default Math.floor(totalCols * 0.42)
   */
  dateColStart?: number;
  /** Text động – truyền từ ngoài vào, không hardcode */
  labels: {
    /** Vd: "….............., ngày __ tháng __ năm 2026" */
    footerDate: string;
    /** Vd: "Trưởng Đơn Vị" */
    unitHead: string;
    /** Vd: "TL. Hành chánh - Nhân sự" */
    hr: string;
    /** Vd: "Lập Bảng" */
    preparedBy: string;
  };
}

/**
 * Kết quả trả về của buildExcelHeader / buildExcelFooter –
 * dùng để đưa vào AOA và tính merges / styles bên ngoài.
 */
export interface HeaderRows {
  /** Row 0: [companyName, '', ..., title, '', ...] */
  row1: unknown[];
  /** Row 1: [unitName, '', ..., departmentName, '', ...] */
  row2: unknown[];
}

export interface FooterRows {
  /** Row N+0: blank */
  blankRow: unknown[];
  /** Row N+1: date text căn phải */
  dateRow: unknown[];
  /** Row N+2: blank */
  blankSignRow: unknown[];
  /** Row N+3: 3 chữ ký */
  signRow: unknown[];
}

// ─── Merge helpers ────────────────────────────────────────────────────────────

/**
 * Trả về XLSX.Range[] cho phần header (row1, row2).
 * Caller truyền rowOffset nếu header không bắt đầu từ row 0.
 */
export const buildHeaderMerges = (
  cfg: Pick<ExcelHeaderConfig, 'totalCols' | 'leftInfoCols'>,
  rowOffset = 0,
): XLSX.Range[] => {
  const split = (cfg.leftInfoCols ?? 4) - 1; // last col of left block (0-based)
  const end = cfg.totalCols - 1;

  return [
    // Row 1: left (company) + right (title)
    { s: { r: rowOffset, c: 0 }, e: { r: rowOffset, c: split } },
    { s: { r: rowOffset, c: split + 1 }, e: { r: rowOffset, c: end } },
    // Row 2: left (unit) + right (department)
    { s: { r: rowOffset + 1, c: 0 }, e: { r: rowOffset + 1, c: split } },
    { s: { r: rowOffset + 1, c: split + 1 }, e: { r: rowOffset + 1, c: end } },
  ];
};

/**
 * Trả về XLSX.Range[] cho phần footer (4 rows: blank / date / blank / sign).
 * Caller truyền rowOffset = index của blankRow đầu tiên.
 */
export const buildFooterMerges = (
  cfg: Pick<ExcelFooterConfig, 'totalCols' | 'dateColStart'>,
  rowOffset: number,
): XLSX.Range[] => {
  const end = cfg.totalCols - 1;
  const dateStart = cfg.dateColStart ?? Math.floor(cfg.totalCols * 0.42);

  // Tính vị trí 3 cụm chữ ký – khớp layout template
  const sig1End = Math.floor(cfg.totalCols * 0.18);
  const sig2Start = Math.floor(cfg.totalCols * 0.35);
  // sig3 bắt đầu tại dateStart — sig2 phải kết thúc trước đó
  const sig3Start = dateStart;
  const sig2End = sig3Start - 2; // đảm bảo không đè lên sig3

  const signRow = rowOffset + 3;
  const dateRow = rowOffset + 1;

  return [
    // Date row: chiếm nửa phải
    { s: { r: dateRow, c: dateStart }, e: { r: dateRow, c: end } },
    // Sign row: 3 cụm
    { s: { r: signRow, c: 0 }, e: { r: signRow, c: sig1End } },
    { s: { r: signRow, c: sig2Start }, e: { r: signRow, c: sig2End } },
    { s: { r: signRow, c: sig3Start }, e: { r: signRow, c: end } },
  ];
};

// ─── AOA builders ─────────────────────────────────────────────────────────────

export const buildHeaderRows = (cfg: ExcelHeaderConfig): HeaderRows => {
  const { companyName, unitName, title, departmentName = '', totalCols, leftInfoCols = 4 } = cfg;

  const row1: unknown[] = Array(totalCols).fill('');
  row1[0] = companyName;
  row1[leftInfoCols] = title;

  const row2: unknown[] = Array(totalCols).fill('');
  row2[0] = unitName;
  row2[leftInfoCols] = departmentName;

  return { row1, row2 };
};

export const buildExcelFooterRows = (cfg: ExcelFooterConfig): FooterRows => {
  const { totalCols, dateColStart, labels } = cfg;
  const dateStart = dateColStart ?? Math.floor(totalCols * 0.42);

  // sig3 bắt đầu tại đúng dateStart → "Lập Bảng" nằm dưới ngày tháng năm
  const sig1Col = 0;
  const sig2Col = Math.floor(totalCols * 0.35);
  const sig3Col = dateStart;

  const blankRow: unknown[] = Array(totalCols).fill('');

  const dateRow: unknown[] = Array(totalCols).fill('');
  dateRow[dateStart] = labels.footerDate;

  const blankSignRow: unknown[] = Array(totalCols).fill('');

  const signRow: unknown[] = Array(totalCols).fill('');
  signRow[sig1Col] = labels.unitHead;
  signRow[sig2Col] = labels.hr;
  signRow[sig3Col] = labels.preparedBy;

  return { blankRow, dateRow, blankSignRow, signRow };
};

// ─── Style appliers ───────────────────────────────────────────────────────────

/** Style cho 2 rows header (row1 & row2) */
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

/** Style cho 4 rows footer (blank / date / blank / sign) */
export const applyFooterStyles = (ws: XLSX.WorkSheet, rowOffset: number, totalCols: number) => {
  const dateRow = rowOffset + 1;
  const signRow = rowOffset + 3;

  for (let C = 0; C < totalCols; C++) {
    for (const R of [dateRow, signRow]) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };

      const isSign = R === signRow;
      ws[addr].s = {
        font: { bold: isSign, sz: 10, name: 'Calibri' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      };
    }
  }
};
