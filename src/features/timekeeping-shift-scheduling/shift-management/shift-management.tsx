import { useMemo } from 'react';
import dayjs from 'dayjs';

import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { TitlePage } from '@/components/title-page';

import { LayoutRenderer } from '../components/layout-renderer';
import { WrapperToolBar } from '../components/wrapper-toolbar';
import { TimekeepingManagementLegend } from '../timekeeping-management/components/timekeeping-management-legend';
import { BtnCreateShift } from './components/btn-create-shift';
import { ShiftManagementGrid } from './components/grid-layout/shift-management-grid';
import { ShiftManagementFilter } from './components/shift-management-filter';
import { ShiftManagementListview } from './components/shift-management-listview';
import { SHIFT_CA_LEGEND } from './constants/data';
import { useShiftManagementList } from './hooks/use-shift-management';

interface ShiftImportRow {
  employeeCode: string;
  employeeName: string;
  shiftDate: string;
  shiftType: string;
  departmentName: string;
  note: string;
}

// const SHIFT_COLUMNS: ExcelColumnDef<ShiftImportRow>[] = [
//   {
//     header: 'Mã nhân viên',
//     key: 'employeeCode',
//     width: 16,
//     required: true,
//     example: 'NV001',
//   },
//   {
//     header: 'Họ và tên',
//     key: 'employeeName',
//     width: 24,
//     required: true,
//     example: 'Nguyễn Văn A',
//   },
//   {
//     header: 'Ngày phân ca',
//     key: 'shiftDate',
//     width: 16,
//     required: true,
//     example: '2025-07-01',
//     exportFormatter: (v) => (v ? dayjs(String(v)).format('YYYY-MM-DD') : ''),
//     importParser: (v) =>
//       v ? dayjs(String(v), ['YYYY-MM-DD', 'DD/MM/YYYY']).format('YYYY-MM-DD') : '',
//   },
//   {
//     header: 'Ca làm việc',
//     key: 'shiftType',
//     width: 16,
//     required: true,
//     example: 'Ca sáng',
//   },
//   {
//     header: 'Phòng ban',
//     key: 'departmentName',
//     width: 20,
//     example: 'Kế toán',
//   },
//   {
//     header: 'Ghi chú',
//     key: 'note',
//     width: 28,
//     example: '',
//   },
// ];

export const ShiftManagement = () => {
  const { filters } = useQueryFilter<ShiftManagementParams>();

  const { startDate, endDate } = useMonthDateRange(filters.month);

  const { data, isLoading } = useShiftManagementList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    startDate,
    endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
  });

  // const exportConfig = useMemo(
  //   () => ({
  //     fileName: `mau_phan_ca_${dayjs().format('YYYYMMDD')}`,
  //     sheetName: 'Phân ca',
  //     columns: SHIFT_COLUMNS,
  //     includeExampleRow: true,
  //   }),
  //   [],
  // );

  // const importConfig = useMemo(
  //   () => ({
  //     columns: SHIFT_COLUMNS,
  //     onImport: async (rows: ShiftImportRow[]) => {
  //       // Gọi API import tại đây
  //       console.log('Rows to import:', rows);
  //       console.log(`Nhập thành công ${rows.length} bản ghi`);
  //     },
  //     onError: (errors: ImportError[]) => {
  //       errors.forEach((e) => console.log(`Dòng ${e.row} - ${e.column}: ${e.message}`));
  //     },
  //   }),
  //   [],
  // );

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-3">
        <WrapperToolBar className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <TitlePage title="Quản lý phân ca" />

            <ActionsPage
              actions={<BtnCreateShift />}
              // exportConfig={exportConfig}
              // importConfig={importConfig}
            />
          </div>
          <ShiftManagementFilter />
        </WrapperToolBar>

        <LayoutRenderer
          layouts={{
            [LayoutSwitcherEnum.LIST]: {
              component: ShiftManagementListview,
              props: {
                data: data?.data,
                total: data?.pagination?.total,
                page: filters.page,
                isLoading,
                pageSize: filters.limit,
                totalPage: data?.pagination?.totalPage,
              },
            },
            [LayoutSwitcherEnum.GRID]: {
              component: ShiftManagementGrid,
              props: { data: data?.data, isLoading },
            },
          }}
        />
      </div>

      <TimekeepingManagementLegend legendItems={SHIFT_CA_LEGEND} />
    </div>
  );
};
