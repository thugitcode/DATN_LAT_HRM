import { Button, Chip, Input, Select, SelectItem, addToast, Divider } from '@heroui/react';
import { IconPrinter, IconList, IconGridDots, IconSearch, IconRefresh, IconFileDownload } from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import { useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import dayjs from 'dayjs';

import { PageContainer } from '@/components/page-container';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';
import { useStaffList, useImportStaff } from '@/query-options/staff';
import type { Staff, ContractTypeEnum } from '@/types/staff.type';
import { StaffTable } from './components/staff-table';
import { StaffGrid } from './components/staff-grid';
import { StaffFormDrawer } from './components/staff-form-drawer';
import { useDisclosure } from '@heroui/react';
import { TitlePage } from '@/components/title-page';
import { ActionsPage } from '@/components/actions-page';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';
import { LayoutSwitcherEnum } from '@/types/global.type';
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
    const searchParams: any = useSearch({ from: '/_private/admin/_dashboard/staff-management/$type' });
    
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
    const { options: roomOptions, isLoading: roomLoading } = useRoomOptions(filters.departmentId);

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
    const { exportStaff } = useStaffExport(staffData)
    
    const handleViewDetail = (id: string) => {
        navigate({
            to: '/admin/staff-management/detail/$id',
            params: { id },
        });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingStaff, setEditingStaff] = useState<Staff | undefined>();
    const { mutateAsync: importStaff, isPending: isImporting } = useImportStaff();

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
                    defval: ""
                });

                if (jsonData.length === 0) {
                    addToast({ title: 'File không có dữ liệu', color: 'warning' });
                    return;
                }

                const rows = jsonData.map((row: any) => {
                    const formatExcelDate = (val: any) => {
                        if (!val) return "";
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
                        emergencyContactRelationship: row['Mối quan hệ với người liên hệ khẩn cấp']?.toString().trim(),
                        departmentCodes: row['Khoa quản lý (*)']?.toString()?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
                        roomCodes: row['Phòng quản lý']?.toString()?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
                        workType: row['Loại hình']?.toString().trim(),
                        jobTitle: row['Chức danh (*)']?.toString().trim(),
                        position: row['Cấp bậc (*)']?.toString().trim(),
                        contractType: row['Loại hợp đồng']?.toString().trim(),
                        contractDuration: row['Thời hạn làm việc']?.toString().trim(),
                        qualification: row['Trình độ chuyên môn (*)']?.toString().trim(),
                        major: row['Chuyên ngành']?.toString().trim(),
                        academicDegree: row['Học hàm học vị']?.toString().trim(),
                        practicingCertificateCode: row['Số CCHN']?.toString().trim(),
                        practicingCertificatePlace: row['Nơi cấp_1']?.toString().trim(),
                        practicingCertificateExpiryDate: formatExcelDate(row['Ngày hết hạn']),
                        taxCode: row['Mã số thuế']?.toString().trim(),
                        insuranceCode: row['Số BHYT']?.toString().trim(),
                        bankAccount: row['Số tài khoản']?.toString().trim(),
                        bankAccountName: row['Tên người thụ hưởng']?.toString().trim(),
                        bankName: row['Tên ngân hàng']?.toString().trim(),
                        note: row['Ghi chú']?.toString().trim(),
                    };
                }).filter(row => row.code && row.name);
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
            <PageContainer className="p-6 space-y-5 flex flex-col h-full bg-[#FAFAFA]">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-[#11181C]">{title}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Chip size="md" variant="bordered" classNames={{ content: '!leading-5 text-base', base: "py-1 px-2" }} startContent={<span className="w-1.5 h-1.5 rounded-full p-1 bg-[#17C964] mr-1"></span>}>
                                Đang làm việc: {workingCount}
                            </Chip>
                            <Chip size="md" variant="bordered" classNames={{ content: '!leading-5 text-base', base: "py-1 px-2" }} startContent={<span className="w-1.5 h-1.5 rounded-full bg-[#71717A] mr-1"></span>}>
                                Nghỉ: {resignedCount}
                            </Chip>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* <div className="flex items-center gap-2">
                            <Button
                                isIconOnly
                                variant="flat"
                                className="bg-white border-1 border-[#F4F4F5] text-[#71717A] rounded-xl shadow-sm h-10 w-10 min-w-10"
                                onPress={() => window.location.reload()}
                            >
                                <IconRefresh size={20} />
                            </Button>

                            <Button
                                isIconOnly
                                variant="flat"
                                className="bg-white border-1 border-[#F4F4F5] text-[#71717A] rounded-xl shadow-sm h-10 w-10 min-w-10"
                                onPress={() => fileInputRef.current?.click()}
                                isLoading={isImporting}
                            >
                                <IconFileDownload size={20} />
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleImportExcel}
                            />

                            <Button
                                isIconOnly
                                variant="flat"
                                className="bg-white border-1 border-[#F4F4F5] text-[#71717A] rounded-xl shadow-sm h-10 w-10 min-w-10"
                            >
                                <IconPrinter size={20} />
                            </Button>
                        </div>

                        <Divider orientation="vertical" className="h-6" />

                        <div className="bg-[#F4F4F5] rounded-xl p-1 flex items-center gap-1 border border-[#E4E4E7]">
                            <Button
                                isIconOnly
                                variant={viewMode === 'list' ? 'solid' : 'light'}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                                className={`rounded-lg h-8 w-10 min-w-10 ${viewMode !== 'list' ? 'text-[#71717A]' : 'shadow-sm'}`}
                                onPress={() => setViewMode('list')}
                            >
                                <IconList size={18} />
                            </Button>
                            <Button
                                isIconOnly
                                variant={viewMode === 'grid' ? 'solid' : 'light'}
                                color={viewMode === 'grid' ? 'primary' : 'default'}
                                className={`rounded-lg h-8 w-10 min-w-10 ${viewMode !== 'grid' ? 'text-[#71717A]' : 'shadow-sm'}`}
                                onPress={() => setViewMode('grid')}
                            >
                                <IconGridDots size={18} />
                            </Button>
                        </div>

                        <Divider orientation="vertical" className="h-6" />

                        <Button
                            color="primary"
                            className="h-10 px-4 font-medium rounded-xl shadow-sm"
                            onPress={() => {
                                console.log("Opening StaffFormDrawer");
                                onOpen();
                            }}
                        >
                            Thêm mới nhân viên
                        </Button> */}
                    </div>
                    <ActionsPage
                        // hiddenLayoutSwitcher={activeKey === TAB_KEYS.DETAILED_TIME_SHEET}
                        onExport={exportStaff}
                        actions={
                            <div className="flex gap-3">
                                <Button color="primary" onPress={onOpen}>
                                    Thêm mới nhân viên
                                </Button>
                            </div>
                        }
                    />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#F4F4F5] flex-1 flex flex-col overflow-hidden p-4">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                        <Input
                            placeholder="Tìm kiếm"
                            startContent={<IconSearch size={18} className="text-[#A1A1AA]" />}
                            value={filters.search || ''}
                            onValueChange={(val) => setFilters({ search: val })}
                            classNames={{ inputWrapper: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                        />
                        <Select
                            placeholder="Chức danh"
                            classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                            selectedKeys={filters.jobTitle ? [filters.jobTitle] : ['ALL']}
                            onSelectionChange={(keys) => {
                                const val = Array.from(keys)[0] as string;
                                setFilters({ jobTitle: val === 'ALL' ? undefined : val });
                            }}
                        >
                            <SelectItem key="ALL">Tất cả chức danh</SelectItem>
                            <SelectItem key="DOCTOR">Bác sĩ</SelectItem>
                            <SelectItem key="NURSE">Điều dưỡng</SelectItem>
                            <SelectItem key="TECHNICIAN">Kỹ thuật viên</SelectItem>
                            <SelectItem key="MIDWIFE">Hộ sinh</SelectItem>
                            <SelectItem key="PHYSICIAN_ASSISTANT">Y sĩ</SelectItem>
                            <SelectItem key="PHARMACIST">Dược sĩ</SelectItem>
                            <SelectItem key="RECEPTIONIST">Lễ tân</SelectItem>
                            <SelectItem key="MANAGEMENT">Quản trị</SelectItem>
                        </Select>
                        <Select
                            placeholder="Cấp bậc"
                            classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                            selectedKeys={filters.positions ? [filters.positions[0]] : ['ALL']}
                            onSelectionChange={(keys) => {
                                const val = Array.from(keys)[0] as string;
                                setFilters({ positions: val === 'ALL' ? undefined : [val] });
                            }}
                        >
                            {[
                                <SelectItem key="ALL">Tất cả cấp bậc</SelectItem>,
                                ...POSITION_OPTIONS.map((o) => (
                                    <SelectItem key={o.key}>{o.label}</SelectItem>
                                )),
                            ]}
                        </Select>
                        <Select
                            placeholder="Trạng thái"
                            classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                            selectedKeys={filters.status ? [filters.status] : ['ALL']}
                            onSelectionChange={(keys) => {
                                const val = Array.from(keys)[0] as string;
                                setFilters({ status: val === 'ALL' ? undefined : val });
                            }}
                        >
                            <SelectItem key="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem key="WORKING">Đang làm việc</SelectItem>
                            <SelectItem key="PENDING">Chờ duyệt</SelectItem>
                            <SelectItem key="RESIGNED">Đã nghỉ</SelectItem>
                        </Select>
                        <Select
                            placeholder="Khoa"
                            isLoading={deptLoading}
                            classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                            selectedKeys={filters.departmentId ? [filters.departmentId] : ['ALL']}
                            onSelectionChange={(keys) => {
                                const val = Array.from(keys)[0] as string;
                                setFilters({ departmentId: val === 'ALL' ? undefined : val, roomId: undefined });
                            }}
                            items={[
                                { value: 'ALL', label: 'Tất cả khoa' },
                                ...departmentOptions
                            ]}
                        >
                            {(opt: any) => (
                                <SelectItem key={opt.value}>{opt.label}</SelectItem>
                            )}
                        </Select>
                        <Select
                            placeholder="Phòng"
                            isLoading={roomLoading}
                            classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                            selectedKeys={filters.roomId ? [filters.roomId] : ['ALL']}
                            onSelectionChange={(keys) => {
                                const val = Array.from(keys)[0] as string;
                                setFilters({ roomId: val === 'ALL' ? undefined : val });
                            }}
                            items={[
                                { value: 'ALL', label: 'Tất cả phòng' },
                                ...roomOptions
                            ]}
                        >
                            {(opt: any) => (
                                <SelectItem key={opt.value}>{opt.label}</SelectItem>
                            )}
                        </Select>
                    </div>
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
                                    onEdit: handleEdit
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
            </PageContainer>
            <StaffFormDrawer isOpen={isOpen} onClose={handleCloseDrawer} editData={editingStaff} />
        </>
    );
};
