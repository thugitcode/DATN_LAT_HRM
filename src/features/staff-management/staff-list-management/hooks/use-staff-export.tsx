import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';

import type { Staff } from '@/types/staff.type';
import { translateJobTitle, translatePosition } from '../../time-attendance-management/helpers';
import { buildSheet, writeWorkbook, type SheetData } from '@/features/timekeeping-shift-scheduling/timekeeping-management/export-engine/export.engine';

// ─── Column Definitions ───────────────────────────────────────────────────────

const FIXED_COLS = [
  { label: 'STT', wch: 8, align: 'center' as const },
  { label: 'Mã nhân viên', wch: 18, align: 'left' as const },
  { label: 'Tên nhân viên', wch: 28, align: 'left' as const },
  { label: 'Ngày sinh', wch: 14, align: 'center' as const },
  { label: 'Giới tính', wch: 10, align: 'center' as const },
  { label: 'Số điện thoại', wch: 16, align: 'left' as const },
  { label: 'Email', wch: 28, align: 'left' as const },
  { label: 'Chức danh', wch: 18, align: 'left' as const },
  { label: 'Cấp bậc', wch: 18, align: 'left' as const },
  { label: 'Khoa', wch: 30, align: 'left' as const },
  { label: 'Phòng', wch: 30, align: 'left' as const },
  { label: 'Loại hình', wch: 14, align: 'center' as const },
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

export const exportStaffTemplate = (data: any[]) => {
  const aoa: unknown[][] = [];
  const merges: XLSX.Range[] = [];

  // ── Header chính khớp với handleImportExcel (jsonData map từ row['...']) ──
  const headers = [
    'STT',
    'Mã nhân viên (*)',
    'Tên nhân viên (*)',
    'Ngày sinh (*)',
    'Giới tính (*)',
    'Số CCCD/Passport',
    'Ngày cấp',
    'Nơi cấp',
    'Quốc tịch',
    'Địa chỉ',
    'Số điện thoại (*)',
    'Email(*)',
    'Tên liên hệ khẩn cấp',
    'Số điện thoại (khẩn cấp)',
    'Địa chỉ liên hệ khẩn cấp',
    'Mối quan hệ với người liên hệ khẩn cấp',
    'Khoa quản lý (*)',
    'Phòng quản lý',
    'Loại hình',
    'Chức danh (*)',
    'Cấp bậc (*)',
    'Loại hợp đồng',
    'Thời hạn làm việc',
    'Trình độ chuyên môn (*)',
    'Chuyên ngành',
    'Học hàm học vị',
    'Số CCHN',
    'Nơi cấp',
    'Ngày hết hạn',
    'Mã số thuế',
    'Số BHYT',
    'Số tài khoản',
    'Tên người thụ hưởng',
    'Tên ngân hàng',
    'Ghi chú'
  ];

  // ── Row 0 & 1: Tiêu đề file (Sẽ bị bỏ qua khi import vì range: 3) ──
  aoa.push(['DANH SÁCH NHẬP LIỆU NHÂN VIÊN']);
  aoa.push([`Ngày tạo: ${dayjs().format('DD/MM/YYYY')}`]);
  aoa.push([]); // Dòng trống 2

  // ── Row 3: Header cột (Hàm import bắt đầu đọc từ đây nếu range: 3) ──
  aoa.push(headers);

  // ── Merges cho tiêu đề ──
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } });

  // ── Fill Data (Nếu có data truyền vào) ──
  data.forEach((item, idx) => {
    aoa.push([
      idx + 1,
      item.code || '',
      item.name || '',
      item.birthday ? dayjs(item.birthday).format('YYYY-MM-DD') : '', // Để ISO cho Excel dễ nhận diện
      item.gender === 'MALE' ? 'Nam' : 'Nữ',
      item.identity || '',
      item.identityIssueDate || '',
      item.identityIssuePlace || '',
      item.nationality || 'Việt Nam',
      item.address || '',
      item.phone || '',
      item.email || '',
      item.emergencyContactName || '',
      item.emergencyContactPhone || '',
      item.emergencyContactAddress || '',
      item.emergencyContactRelationship || '',
      item.departments?.map((d: any) => d.code).join(', ') || '',
      item.rooms?.map((r: any) => r.code).join(', ') || '',
      item.workType || '',
      item.jobTitle || '',
      item.position || '',
      item.contractType || '',
      item.contractDuration || '',
      item.qualification || '',
      item.major || '',
      item.academicDegree || '',
      item.practicingCertificateCode || '',
      item.practicingCertificatePlace || '',
      item.practicingCertificateExpiryDate || '',
      item.taxCode || '',
      item.insuranceCode || '',
      item.bankAccount || '',
      item.bankAccountName || '',
      item.bankName || '',
      item.note || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;

  // ── Style cho giống file phân ca của ông ──
  const border = {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  };

  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };

      if (R === 0) { // Title
        ws[addr].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
      } else if (R === 3) { // Header
        ws[addr].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '374151' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border
        };
      } else if (R > 3) { // Data
        ws[addr].s = { border, alignment: { vertical: 'center' } };
      }
    }
  }

  // Set chiều rộng cột tự động cơ bản
  ws['!cols'] = headers.map(() => ({ wch: 15 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Import_Staff');
  XLSX.writeFile(wb, `Mau_Import_Nhan_Vien.xlsx`);
};

export const useStaffExport = (data: Staff[] = []) => {
  const exportStaff = useMemo(() => {
    return () => exportStaffList(data);
  }, [data]);
  const onExportStaffTemplate = useCallback(() => {
    exportStaffTemplate(data ?? []);
  }, [data]);
  return { exportStaff, onExportStaffTemplate };
};