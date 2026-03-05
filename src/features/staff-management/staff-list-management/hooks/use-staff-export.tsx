import { useMemo } from 'react';

import type { ExcelColumnDef, ExcelExportConfig } from '@/hooks/use-excel-io';
import type { Staff } from '@/types/staff.type';
import type { StaffExportRow } from '../types';

const STAFF_COLUMNS: ExcelColumnDef<StaffExportRow>[] = [
  { header: 'STT', key: 'stt', width: 8 },
  { header: 'Mã nhân viên', key: 'employeeCode', width: 20 },
  { header: 'Tên nhân viên', key: 'employeeName', width: 30 },
  { header: 'Ngày sinh', key: 'birthday', width: 15 },
  { header: 'Giới tính', key: 'gender', width: 12 },
  { header: 'Số điện thoại', key: 'phone', width: 18 },
  { header: 'Email', key: 'email', width: 30 },
  { header: 'Chức danh', key: 'jobTitle', width: 18 },
  { header: 'Chức vụ', key: 'position', width: 18 },
  { header: 'Khoa', key: 'departments', width: 35 },
  { header: 'Phòng', key: 'rooms', width: 35 },
  { header: 'Trạng thái', key: 'status', width: 15 },
];

export const buildStaffTableExport = (
  data: Staff[],
): { columns: ExcelColumnDef<StaffExportRow>[]; rows: StaffExportRow[] } => {
  const rows = data.map((staff, index) => {
    const row: StaffExportRow = {
      stt: index + 1,
      employeeCode: staff.code ?? '',
      employeeName: staff.name ?? '',
      birthday: staff.birthday ?? '',
      gender: staff.gender === 'MALE' ? 'Nam' : 'Nữ',
      phone: staff.phone ?? '',
      email: staff.email ?? '',
      jobTitle: staff.jobTitle ?? '',
      position: staff.position ?? '',
      departments:
        staff.departments?.map((d) => d.name).filter(Boolean).join(', ') ?? '',
      rooms: staff.rooms?.map((r) => r.name).filter(Boolean).join(', ') ?? '',
      status: staff.status ?? '',
    };

    return row;
  });  
  return {
    columns: STAFF_COLUMNS,
    rows,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useStaffExport = (
  data: Staff[] = [],
) => {
  const exportConfig = useMemo<ExcelExportConfig<StaffExportRow>>(() => {
    const { columns, rows } = buildStaffTableExport(data);

    return {
      fileName: `danh_sach_nhan_vien`,
      sheetName: 'Danh sách nhân viên',
      columns,
      data: rows,
      defaultRowHeight: 40,
      headerRowHeight: 42,
    };
  }, [data]);

  return { exportConfig };
};
