import { useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { useImportStaff, useStaffList } from '@/query-options/staff';
import { addToast, Button, Chip, useDisclosure } from '@heroui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

import { LayoutSwitcherEnum } from '@/types/global.type';
import type { ContractTypeEnum, Staff } from '@/types/staff.type';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';
import { ActionsPage } from '@/components/actions-page';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';

import { ControlMode, useControlMode } from '../salary-and-benefits/hooks/use-control-mode-handle';
import { StaffFilters } from './components/staff-filter';
import { StaffFormDrawer } from './components/staff-form-drawer';
import { StaffGrid } from './components/staff-grid';
import { StaffListPrint } from './components/staff-list-print';
import { StaffTable } from './components/staff-table';
import { useStaffExport } from './hooks/use-staff-export';

const POSITION_OPTIONS = [
  { key: 'STAFF', label: 'Nhân viên' },
  { key: 'HEAD_OF_DEPARTMENT', label: 'Trưởng khoa' },
  { key: 'DEPUTY_HEAD_OF_DEPARTMENT', label: 'Phó khoa' },
  { key: 'CHIEF_NURSE', label: 'Điều dưỡng trưởng' },
  { key: 'MANAGER', label: 'Trưởng phòng' },
  { key: 'HEAD_OF_UNIT', label: 'Trưởng bộ phận' },
  { key: 'DEPUTY_MANAGER', label: 'Phó phòng' },
];

interface StaffListProps {
  title: string;
  contractType: ContractTypeEnum;
}

export const StaffList = ({ title, contractType }: StaffListProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const searchParams: any = useSearch({
    from: '/_private/admin/_dashboard/staff-management/$type',
  });
  const printRef = useRef<HTMLDivElement>(null);
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;

  const filters = {
    search: searchParams.search,
    status: searchParams.status,
    jobTitle: searchParams.jobTitle,
    positions: searchParams.positions,
    departmentId: searchParams.departmentId,
    roomId: searchParams.roomId,
  };

  const setFilters = (newFilters: any) => {
    navigate({
      search: { ...searchParams, ...newFilters },
      replace: true,
    });
  };

  const setPage = (p: number) => setFilters({ page: p });
  const setLimit = (l: number) => setFilters({ limit: l });

  const { options: departmentOptions, isLoading: deptLoading } = useDepartmentOptions();
  const { options: roomOptions, isLoading: roomLoading } = useRoomOptions(filters?.departmentId);

  const { data: response, isLoading } = useStaffList({
    page,
    limit,
    search: filters.search,
    status: filters.status,
    jobTitle: filters.jobTitle,
    positions: filters.positions,
    departmentIds: filters.departmentId ? [filters.departmentId] : undefined,
    roomIds: filters.roomId ? [filters.roomId] : undefined,
    contractType: contractType,
  });

  const staffData: Staff[] = (response?.data as unknown as Staff[]) || [];
  const total = response?.pagination?.total || 0;
  const workingCount = (response?.metadata?.WORKING as number) || 0;
  const resignedCount = (response?.metadata?.RESIGNED as number) || 0;
  const { exportStaff, onExportStaffTemplate } = useStaffExport(staffData);
  const { setMode } = useControlMode();
  const handleViewDetail = (id: string) => {
    setMode(ControlMode.edit);
    navigate({
      to: '/admin/staff-management/detail/$id',
      params: { id },
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>();
  const { mutateAsync: importStaff, isPending: isImporting } = useImportStaff();

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    onOpen();
  };

  const handleCloseDrawer = () => {
    setEditingStaff(undefined);
    onClose();
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          addToast({ title: 'File Excel không hợp lệ', color: 'danger' });
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          addToast({ title: 'Không tìm thấy worksheet', color: 'danger' });
          return;
        }
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
          raw: false,
          defval: '',
        });

        if (jsonData.length === 0) {
          addToast({ title: 'File không có dữ liệu', color: 'warning' });
          return;
        }

        const rows = jsonData
          .map((row: any) => {
            const formatExcelDate = (val: any) => {
              if (!val) return '';
              return dayjs(val).isValid() ? dayjs(val).format('DD/MM/YYYY') : val;
            };

            return {
              code: row['Mã nhân viên (*)']?.toString().trim(),
              name: row['Tên nhân viên (*)']?.toString().trim(),
              birthday: formatExcelDate(row['Ngày sinh (*)']),
              gender: row['Giới tính (*)']?.toString().trim(),
              identity: row['Số CCCD/Passport']?.toString().trim(),
              identityIssueDate: formatExcelDate(row['Ngày cấp']),
              identityIssuePlace: row['Nơi cấp']?.toString().trim(),
              nationality: row['Quốc tịch']?.toString().trim(),
              address: row['Địa chỉ']?.toString().trim(),
              phone: row['Số điện thoại (*)']?.toString().trim(),
              email: row['Email(*)']?.toString().trim(),
              emergencyContactName: row['Tên liên hệ khẩn cấp']?.toString().trim(),
              emergencyContactPhone: row['Số điện thoại (khẩn cấp)']?.toString().trim(),
              emergencyContactAddress: row['Địa chỉ liên hệ khẩn cấp']?.toString().trim(),
              emergencyContactRelationship: row['Mối quan hệ với người liên hệ khẩn cấp']
                ?.toString()
                .trim(),
              departmentCodes:
                row['Khoa quản lý (*)']
                  ?.toString()
                  ?.split(',')
                  .map((s: string) => s.trim())
                  .filter(Boolean) || [],
              roomCodes:
                row['Phòng quản lý']
                  ?.toString()
                  ?.split(',')
                  .map((s: string) => s.trim())
                  .filter(Boolean) || [],
              workType: row['Loại hình']?.toString().trim(),
              jobTitle: row['Chức danh (*)']?.toString().trim(),
              position: row['Cấp bậc (*)']?.toString().trim(),
              contractType: row['Loại hợp đồng']?.toString().trim(),
              contractDuration: row['Thời hạn làm việc']?.toString().trim(),
              qualification: row['Trình độ chuyên môn (*)']?.toString().trim(),
              major: row['Chuyên ngành']?.toString().trim(),
              academicDegree: row['Học hàm học vị']?.toString().trim(),
              practicingCertificateCode: row['Số CCHN']?.toString().trim(),
              practicingCertificatePlace: row['Nơi cấp']?.toString().trim(),
              practicingCertificateExpiryDate: formatExcelDate(row['Ngày hết hạn']),
              taxCode: row['Mã số thuế']?.toString().trim(),
              insuranceCode: row['Số BHYT']?.toString().trim(),
              bankAccount: row['Số tài khoản']?.toString().trim(),
              bankAccountName: row['Tên người thụ hưởng']?.toString().trim(),
              bankName: row['Tên ngân hàng']?.toString().trim(),
              note: row['Ghi chú']?.toString().trim(),
            };
          })
          .filter((row) => row.code && row.name);
        await importStaff({ rows });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error('Import error:', error);
        addToast({ title: 'Lỗi khi đọc file Excel', color: 'danger' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="space-y-4 flex flex-col h-full bg-[#FAFAFA]">
        {/* Header Section */}
        <div className="px-6 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#11181C]">{title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Chip
                size="md"
                variant="bordered"
                classNames={{ content: '!leading-5 text-base', base: 'py-1 px-2' }}
                startContent={
                  <span className="w-1.5 h-1.5 rounded-full p-1 bg-[#17C964] mr-1"></span>
                }
              >
                {t('options.staff_status.WORKING')}: {workingCount}
              </Chip>
              <Chip
                size="md"
                variant="bordered"
                classNames={{ content: '!leading-5 text-base', base: 'py-1 px-2' }}
                startContent={<span className="w-1.5 h-1.5 rounded-full bg-[#71717A] mr-1"></span>}
              >
                {t('off')}: {resignedCount}
              </Chip>
            </div>
          </div>

          <div className="flex items-center gap-3"></div>
          <ActionsPage
            onExportTemplate={onExportStaffTemplate}
            onPrint={handlePrint}
            onExport={exportStaff}
            onImport={() => fileInputRef.current?.click()}
            actions={
              <div className="flex gap-3">
                <Button color="primary" onPress={onOpen}>
                  {t('button.add_staff')}
                </Button>
              </div>
            }
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <StaffFilters
            filters={filters}
            setFilters={setFilters}
            deptLoading={deptLoading}
            roomLoading={roomLoading}
            departmentOptions={departmentOptions}
            roomOptions={roomOptions}
          />
          <LayoutRenderer
            layouts={{
              [LayoutSwitcherEnum.LIST]: {
                component: StaffTable,
                props: {
                  data: staffData,
                  loading: isLoading,
                  page: page,
                  limit: limit,
                  total: total,
                  onPageChange: setPage,
                  onLimitChange: setLimit,
                  onViewDetail: handleViewDetail,
                  onEdit: handleEdit,
                },
              },
              [LayoutSwitcherEnum.GRID]: {
                component: StaffGrid,
                props: {
                  data: staffData,
                  loading: isLoading,
                  page: page,
                  limit: limit,
                  total: total,
                  onPageChange: setPage,
                  onLimitChange: setLimit,
                  onViewDetail: handleViewDetail,
                  onEdit: handleEdit,
                },
              },
            }}
          />
        </div>
      </div>
      <StaffFormDrawer isOpen={isOpen} onClose={handleCloseDrawer} editData={editingStaff} />
      <div style={{ display: 'none' }}>
        <StaffListPrint ref={printRef} data={response?.data ?? []} />
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleImportExcel}
      />
    </>
  );
};
