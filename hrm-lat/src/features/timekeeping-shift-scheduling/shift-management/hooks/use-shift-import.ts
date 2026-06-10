import { useCallback } from 'react';
import * as XLSX from 'xlsx';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ShiftImportRow {
  staffCode: string;
  staffName: string;
  department: string;
  position: string;
  days: {
    date: string; // "2026-03-01"
    shiftCode: string; // tên ca — dòng đầu của cell
    rawTimeRange?: string; // "HH:MM-HH:MM" — dòng thứ 2 nếu có, dùng làm fallback giờ
  }[];
}

export interface ParseShiftResult {
  month: number;
  year: number;
  rows: ShiftImportRow[];
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parse file Excel phân ca theo cấu trúc:
 *   Row 1-3 : tiêu đề công ty / khoa
 *   Row 4   : số ngày (1..31)
 *   Row 5   : header cột (STT, Khoa, Mã NV, Tên NV, Chức vụ, CN/T2/T3...)
 *   Row 6+  : data từng nhân viên
 */
export const parseShiftExcel = (arrayBuffer: ArrayBuffer): ParseShiftResult => {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
    header: 1,
    defval: null,
  });

  // Row 4 (index 3): số ngày trong tháng
  const dayRow = raw[3] as (number | null)[];
  // Row 1 (index 0): tìm năm/tháng từ tiêu đề nếu cần — fallback hiện tại
  // Tìm header title để parse tháng/năm
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();

  // Tìm trong row 1: "BẢNG PHÂN CA THÁNG 3 NĂM 2026"
  for (const row of raw.slice(0, 4)) {
    for (const cell of row ?? []) {
      if (typeof cell === 'string') {
        const m = cell.match(/THÁNG\s+(\d+)\s+NĂM\s+(\d+)/i);
        if (m) {
          month = parseInt(m[1]);
          year = parseInt(m[2]);
        }
      }
    }
  }

  // Row 5 (index 4): header — cột 0..4 là meta, 5+ là các ngày
  // Cột ngày bắt đầu từ index 5 (tương ứng dayRow[5] = ngày 1)
  const DATE_COL_START = 5;

  // Map colIndex → date string "YYYY-MM-DD"
  const colDateMap: Record<number, string> = {};
  dayRow.forEach((day, colIdx) => {
    if (colIdx >= DATE_COL_START && typeof day === 'number') {
      const d = String(day).padStart(2, '0');
      const mo = String(month).padStart(2, '0');
      colDateMap[colIdx] = `${year}-${mo}-${d}`;
    }
  });

  // Row 6+ (index 5+): data
  const dataRows = raw.slice(5);

  const rows: ShiftImportRow[] = dataRows
    .filter((row) => row && row[2]) // bỏ rows không có mã NV
    .map((row) => {
      const department = String(row[1] ?? '')
        .split('\n')[0]
        .trim(); // lấy khoa đầu tiên nếu multi
      const staffCode = String(row[2] ?? '').trim();
      const staffName = String(row[3] ?? '').trim();
      const position = String(row[4] ?? '').trim();

      const days: ShiftImportRow['days'] = [];
      Object.entries(colDateMap).forEach(([colIdxStr, date]) => {
        const colIdx = parseInt(colIdxStr);
        const rawCell = row[colIdx];
        if (rawCell === null || rawCell === undefined || String(rawCell).trim() === '') return;

        // 1 cell có thể chứa nhiều ca, format:
        //   "TênCa\nHH:MM-HH:MM"                   — 1 ca
        //   "Ca1\n07:00-11:00\nCa2\n13:00-17:00"  — 2 ca
        // Pattern: dòng lẻ = tên ca, dòng chẵn = giờ (nếu match HH:MM-HH:MM)
        const lines = String(rawCell)
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);

        const isTimeLine = (s: string) => /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(s);

        // Gom thành từng cặp [tênCa, giờ?]
        let i = 0;
        const shiftChunks: { shiftCode: string; rawTimeRange?: string }[] = [];
        while (i < lines.length) {
          const line = lines[i];
          if (!isTimeLine(line)) {
            // Đây là tên ca
            const nextLine = lines[i + 1];
            if (nextLine && isTimeLine(nextLine)) {
              shiftChunks.push({ shiftCode: line, rawTimeRange: nextLine });
              i += 2;
            } else {
              shiftChunks.push({ shiftCode: line });
              i += 1;
            }
          } else {
            // Dòng giờ không có tên ca đi kèm — bỏ qua
            i += 1;
          }
        }

        // Fallback: nếu parse ra rỗng, coi cả cell là tên ca
        if (shiftChunks.length === 0) {
          shiftChunks.push({ shiftCode: String(rawCell).trim() });
        }

        shiftChunks.forEach((chunk) => {
          days.push({ date, ...chunk });
        });
      });

      return { staffCode, staffName, department, position, days };
    });

  return { month, year, rows };
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseShiftImportConfig {
  onParsed: (result: ParseShiftResult) => void;
  onError?: (err: Error) => void;
}

export const useShiftImport = ({ onParsed, onError }: UseShiftImportConfig) => {
  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const buffer = await file.arrayBuffer();
        const result = parseShiftExcel(buffer);
        onParsed(result);
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error('Parse thất bại'));
      } finally {
        if (e.target) e.target.value = '';
      }
    },
    [onParsed, onError],
  );

  return { handleFile };
};
