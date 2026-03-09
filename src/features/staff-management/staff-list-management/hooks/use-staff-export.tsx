import { useMemo } from 'react';
import dayjs from 'dayjs';

import type { Staff } from '@/types/staff.type';
import { translateJobTitle, translatePosition } from '../../time-attendance-management/helpers';
import { buildSheet, writeWorkbook, type SheetData } from '@/features/timekeeping-shift-scheduling/timekeeping-management/export-engine/export.engine';

// ─── Column Definitions ───────────────────────────────────────────────────────

const FIXED_COLS = [
  { label: 'STT',          wch: 8,   align: 'center' as const },
  { label: 'Mã nhân viên',  wch: 18,  align: 'left'   as const },
  { label: 'Tên nhân viên', wch: 28,  align: 'left'   as const },
  { label: 'Ngày sinh',     wch: 14,  align: 'center' as const },
  { label: 'Giới tính',     wch: 10,  align: 'center' as const },
  { label: 'Số điện thoại', wch: 16,  align: 'left'   as const },
  { label: 'Email',         wch: 28,  align: 'left'   as const },
  { label: 'Chức danh',     wch: 18,  align: 'left'   as const },
  { label: 'Cấp bậc',       wch: 18,  align: 'left'   as const },
  { label: 'Khoa',          wch: 30,  align: 'left'   as const },
  { label: 'Phòng',         wch: 30,  align: 'left'   as const },
  { label: 'Loại hình',     wch: 14,  align: 'center' as const },
  { label: 'Ngày hết hạn HĐ', wch: 16, align: 'center' as const },
];

// ─── Build Data Rows ─────────────────────────────────────────────────────────

function buildStaffRows(data: Staff[]): SheetData['rows'] {
  return data.map((staff, index) => {
    const rowCells = [
      index + 1,
      staff.code ?? '',
      staff.name ?? '',
      staff.birthday ? dayjs(staff.birthday).format('DD/MM/YYYY') : '',
      staff.gender === 'MALE' ? 'Nam' : staff.gender === 'FEMALE' ? 'Nữ' : '',
      staff.phone ?? '',
      staff.email ?? '',
      translateJobTitle(staff.jobTitle ?? ''),
      translatePosition(staff.position ?? ''),
      staff.departments?.map(d => d.name).filter(Boolean).join(', ') ?? '',
      staff.rooms?.map(r => r.name).filter(Boolean).join(', ') ?? '',
      staff.workType === 'FULL_TIME' ? 'Toàn thời gian'
        : staff.workType === 'PART_TIME' ? 'Bán thời gian'
        : (staff.workType || '—'),
      staff.endDate ? new Date(staff.endDate).toLocaleDateString('vi-VN') : '—',
    ];

    return { cells: rowCells };
  });
}

// ─── Main Export Function ────────────────────────────────────────────────────

export function exportStaffList(data: Staff[]) {
  if (!data || data.length === 0) {
    console.warn('No staff data to export');
    return;
  }

  const rows = buildStaffRows(data);

  const colHeaderRow = FIXED_COLS.map(c => c.label);

  const sheetData: SheetData = {
    config: {
      title: 'DANH SÁCH NHÂN VIÊN',
      fixedCols: FIXED_COLS,
      dayCols: [],           // không dùng trong danh sách nhân viên
      summaryCols: [],
      headerRowCount: 2,
      leftAlignDataCols: new Set([1, 2, 6, 7, 8, 9, 10]), // cột 1-based: mã, tên, sđt, email, chức danh, cấp bậc, khoa, phòng
    },
    extraHeaderRows: [colHeaderRow],
    extraHeaderMerges: [],   // nếu sau này muốn merge tiêu đề thì thêm vào đây
    rows,
    staffGroups: [],         // không cần group vì mỗi nhân viên chỉ 1 dòng
  };

  const ws = buildSheet(sheetData);

  const today = dayjs().format('YYYYMMDD');
  writeWorkbook(
    ws,
    'Danh sách nhân viên',
    `danh_sach_nhan_vien_${today}.xlsx`,
  );
}

// ─── Hook (nếu vẫn muốn giữ dạng hook) ───────────────────────────────────────

export const useStaffExport = (data: Staff[] = []) => {
  const exportStaff = useMemo(() => {
    return () => exportStaffList(data);
  }, [data]);

  return { exportStaff };
};