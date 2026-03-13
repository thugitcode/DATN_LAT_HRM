import i18n from '@/i18n';
import { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import { formatDate } from '@/lib/utils';

import type { LeaveRequest } from '../type';

// ── i18n helper ───────────────────────────────────────────────────────────────
const tx = (key: string, options?: object) =>
  i18n.t(`${NAMESPACES.LEAVE_MANAGEMENT}:${key}`, options);

// ── Shared styles (mirrors useShiftExport) ────────────────────────────────────
const border = {
  top: { style: 'thin', color: { rgb: 'D1D5DB' } },
  bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
  left: { style: 'thin', color: { rgb: 'D1D5DB' } },
  right: { style: 'thin', color: { rgb: 'D1D5DB' } },
};
const centerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true };
const leftAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };

// ── Column definitions ────────────────────────────────────────────────────────
// Mirrors useColumns() key order — omit 'actions'
const COLUMNS = [
  { key: 'departments', wch: 22 },
  { key: 'staffCode', wch: 14 },
  { key: 'staffName', wch: 22 },
  { key: 'staffPosition', wch: 16 },
  { key: 'leaveReasonName', wch: 18 },
  { key: 'fromDate', wch: 16 },
  { key: 'toDate', wch: 16 },
  { key: 'totalDays', wch: 12 },
  { key: 'reason', wch: 24 },
  { key: 'replacementStaffName', wch: 22 },
  { key: 'approvedByName', wch: 22 },
] as const;

type ColKey = (typeof COLUMNS)[number]['key'];

const HEADER_LABELS: Record<ColKey, () => string> = {
  departments: () => tx('leave_request.columns.department'),
  staffCode: () => tx('leave_request.columns.staff_code'),
  staffName: () => tx('leave_request.columns.staff_name'),
  staffPosition: () => tx('leave_request.columns.position'),
  leaveReasonName: () => tx('leave_request.columns.leave_type'),
  fromDate: () => tx('leave_request.columns.from_date'),
  toDate: () => tx('leave_request.columns.to_date'),
  totalDays: () => tx('leave_request.columns.total_days'),
  reason: () => tx('leave_request.columns.reason'),
  replacementStaffName: () => tx('leave_request.columns.replacement'),
  approvedByName: () => tx('leave_request.columns.approved_by'),
};

// ── Cell value resolver ───────────────────────────────────────────────────────
const getStaffPositionLabel = (pos: string): string => {
  // Reuse the same position map pattern from useShiftExport
  const map: Record<string, string> = {
    STAFF: tx('staff_position.staff'),
    HEAD_OF_DEPARTMENT: tx('staff_position.head_of_department'),
    DEPUTY_HEAD_OF_DEPARTMENT: tx('staff_position.deputy_head_of_department'),
    CHIEF_NURSE: tx('staff_position.chief_nurse'),
    MANAGER: tx('staff_position.manager'),
    HEAD_OF_UNIT: tx('staff_position.head_of_unit'),
    DEPUTY_MANAGER: tx('staff_position.deputy_manager'),
  };
  return map[pos] ?? pos ?? '';
};

const resolveCell = (key: ColKey, row: LeaveRequest): string => {
  switch (key) {
    case 'departments': {
      const depts = row.departments?.map((d: { name: string }) => d.name).join(', ') ?? '';
      const rooms = row.rooms?.map((r: { name: string }) => r.name).join(', ') ?? '';
      return [depts, rooms].filter(Boolean).join('\n');
    }
    case 'staffCode':
      return row.staffCode ?? '';
    case 'staffName':
      return row.staffName ?? '';
    case 'staffPosition':
      return getStaffPositionLabel(row.staffPosition);
    case 'leaveReasonName':
      return row.leaveReasonName ?? '';
    case 'fromDate': {
      const time = row.startTime ? row.startTime.slice(0, 5) + ' ' : '';
      return time + (formatDate(row.fromDate) ?? '');
    }
    case 'toDate': {
      const time = row.endTime ? row.endTime.slice(0, 5) + ' ' : '';
      return time + (formatDate(row.toDate) ?? '');
    }
    case 'totalDays': {
      const days = Number(row.totalDays);
      const display = days % 1 === 0 ? Math.floor(days) : days;
      return tx('leave_request.columns.days_count', { count: display });
    }
    case 'reason':
      return row.reason ?? '';
    case 'replacementStaffName':
      return row.replacementStaffName ?? '';
    case 'approvedByName':
      return row.approvedByName ?? '—';
    default:
      return '';
  }
};

// ── Footer builder (identical pattern to useShiftExport) ──────────────────────
const buildFooterRows = (totalCols: number) => {
  const year = dayjs().year();
  const dateOffset = Math.floor(totalCols * 0.45);
  const col1 = Math.floor(totalCols * 0.05);
  const col2 = Math.floor(totalCols * 0.38);
  const col3 = dateOffset + 2;

  const footerDateRow: unknown[] = Array(dateOffset).fill('');
  footerDateRow.push(tx('print.footer_date', { year }));

  const footerSignRow: unknown[] = Array(totalCols).fill('');
  footerSignRow[col1] = tx('print.footer_unit_head');
  footerSignRow[col2] = tx('print.footer_hr');
  footerSignRow[col3] = tx('print.footer_prepared_by');

  return { footerDateRow, footerSignRow };
};

// ── Style applier ─────────────────────────────────────────────────────────────
const applyStyles = (ws: XLSX.WorkSheet, lastDataRow: number) => {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };

      // Footer rows — no border, light font
      if (R > lastDataRow) {
        ws[addr].s = { alignment: centerAlignment, font: { sz: 10 } };
        continue;
      }

      // Row 0–1: title / department header (mirrors shift export rows 0-1)
      if (R <= 1) {
        ws[addr].s = {
          alignment: C < 3 ? leftAlignment : centerAlignment,
          font: { bold: true, sz: 11 },
        };
        continue;
      }

      // Row 2: column headers
      if (R === 2) {
        ws[addr].s = {
          alignment: centerAlignment,
          border,
          fill: { fgColor: { rgb: 'DBEAFE' } },
          font: { bold: true, color: { rgb: '1E3A5F' }, sz: 11 },
        };
        continue;
      }

      // Data rows — alternate row shading, left-align text cols
      const isEvenDataRow = (R - 3) % 2 === 0;
      const isLeftCol = C >= 1 && C <= 4; // staffCode … leaveReasonName
      ws[addr].s = {
        alignment: isLeftCol ? leftAlignment : centerAlignment,
        border,
        fill: { fgColor: { rgb: isEvenDataRow ? 'FFFFFF' : 'EFF6FF' } },
        font: { sz: 10 },
      };
    }
  }
};

// ── Main export function ───────────────────────────────────────────────────────
export const exportLeaveRequestToExcel = (
  data: LeaveRequest[],
  visibleKeys: Set<string>,
  departmentName: string = '',
) => {
  // Respect column visibility (same as DataTable), always exclude 'actions'
  const activeCols = COLUMNS.filter((c) => visibleKeys.has(c.key));
  const totalCols = activeCols.length;

  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  // ── Row 0: Company name + Title ───────────────────────────────────────────
  aoa.push([
    'Công ty TNHH',
    '',
    '',
    tx('leave_request.title'),
    ...Array(Math.max(0, totalCols - 4)).fill(''),
  ]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
  merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: totalCols - 1 } });

  // ── Row 1: Company sub-name + Department ──────────────────────────────────
  aoa.push([
    tx(''),
    '',
    '',
    departmentName ? `Khoa: ${departmentName}` : '',
    ...Array(Math.max(0, totalCols - 4)).fill(''),
  ]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } });
  merges.push({ s: { r: 1, c: 3 }, e: { r: 1, c: totalCols - 1 } });

  // ── Row 2: Column headers ─────────────────────────────────────────────────
  aoa.push(activeCols.map((c) => HEADER_LABELS[c.key]()));

  // ── Data rows ─────────────────────────────────────────────────────────────
  data.forEach((row) => {
    aoa.push(activeCols.map((c) => resolveCell(c.key, row)));
  });

  const lastDataRow = 2 + data.length; // row index of last data row

  // ── Footer (identical to useShiftExport) ──────────────────────────────────
  const { footerDateRow, footerSignRow } = buildFooterRows(totalCols);
  aoa.push([], [], [], footerDateRow, [], footerSignRow);

  // ── Build worksheet ───────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;
  ws['!cols'] = activeCols.map((c) => ({ wch: c.wch }));
  ws['!rows'] = [{ hpt: 20 }, { hpt: 20 }];

  applyStyles(ws, lastDataRow);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tx('leave_request.title'));
  XLSX.writeFile(wb, `leave_requests_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`);
};
