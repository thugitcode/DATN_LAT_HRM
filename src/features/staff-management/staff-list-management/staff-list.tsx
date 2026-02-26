import { Button, Chip, Input, Select, SelectItem } from '@heroui/react';
import { IconPrinter, IconList, IconGridDots, IconSearch, IconDownload } from '@tabler/icons-react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { PageContainer } from '@/components/page-container';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';
import { useStaffList } from '@/query-options/staff';
import type { Staff, ContractTypeEnum } from '@/types/staff.type';
import { StaffTable } from './components/staff-table';
import { StaffGrid } from './components/staff-grid';

interface StaffListProps {
    title: string;
    contractType: ContractTypeEnum;
}

export const StaffList = ({ title, contractType }: StaffListProps) => {
    const navigate = useNavigate();
    const searchParams: any = useSearch({ from: '/_private/admin/_dashboard/staff-management/$type' });

    const page = searchParams.page || 1;
    const limit = searchParams.limit || 10;
    const viewMode = searchParams.viewMode || 'list';

    const filters = {
        search: searchParams.search,
        status: searchParams.status,
        jobTitle: searchParams.jobTitle,
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
    const setViewMode = (v: 'list' | 'grid') => setFilters({ viewMode: v });

    const { options: departmentOptions, isLoading: deptLoading } = useDepartmentOptions();
    const { options: roomOptions, isLoading: roomLoading } = useRoomOptions(filters.departmentId);

    const { data: response, isLoading } = useStaffList({
        page,
        limit,
        search: filters.search,
        status: filters.status,
        jobTitle: filters.jobTitle,
        departmentIds: filters.departmentId ? [filters.departmentId] : undefined,
        roomIds: filters.roomId ? [filters.roomId] : undefined,
        contractType: contractType,
    });

    const staffData: Staff[] = (response?.data as unknown as Staff[]) || [];
    const total = response?.pagination?.total || 0;
    const workingCount = (response?.metadata?.WORKING as number) || 0;
    const resignedCount = (response?.metadata?.RESIGNED as number) || 0;

    const handleViewDetail = (id: string) => {
        navigate({
            to: '/admin/staff-management/detail/$id',
            params: { id },
        });
    };

    return (
        <PageContainer className="p-6 space-y-5 flex flex-col h-full bg-[#FAFAFA]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#11181C]">{title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Chip size="sm" color="success" variant="flat" classNames={{ content: 'text-[#17C964] font-medium text-xs' }} startContent={<span className="w-1.5 h-1.5 rounded-full bg-[#17C964] mr-1"></span>}>
                            Đang làm việc: {workingCount}
                        </Chip>
                        <Chip size="sm" color="default" variant="flat" classNames={{ content: 'text-[#71717A] font-medium text-xs' }} startContent={<span className="w-1.5 h-1.5 rounded-full bg-[#71717A] mr-1"></span>}>
                            Nghỉ: {resignedCount}
                        </Chip>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button isIconOnly variant="flat" className="bg-white border-1 border-[#F4F4F5] rounded-xl shadow-sm text-[#71717A]">
                        <IconDownload size={20} />
                    </Button>
                    <Button isIconOnly variant="flat" className="bg-white border-1 border-[#F4F4F5] rounded-xl shadow-sm text-[#71717A]">
                        <IconPrinter size={20} />
                    </Button>
                    <div className="bg-[#E4E4E7] rounded-xl p-1 flex items-center">
                        <Button isIconOnly variant={viewMode === 'list' ? 'solid' : 'light'} color={viewMode === 'list' ? 'primary' : 'default'} className={`rounded-lg h-8 w-10 ${viewMode !== 'list' ? 'text-[#71717A]' : ''}`} onPress={() => setViewMode('list')}>
                            <IconList size={18} />
                        </Button>
                        <Button isIconOnly variant={viewMode === 'grid' ? 'solid' : 'light'} color={viewMode === 'grid' ? 'primary' : 'default'} className={`rounded-lg h-8 w-10 ${viewMode !== 'grid' ? 'text-[#71717A]' : ''}`} onPress={() => setViewMode('grid')}>
                            <IconGridDots size={18} />
                        </Button>
                    </div>
                    <Button color="primary" className="h-10 px-4 font-medium rounded-xl">
                        Thêm mới nhân viên
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#F4F4F5] flex-1 flex flex-col overflow-hidden p-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
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
                        selectedKeys={filters.jobTitle ? [filters.jobTitle] : []}
                        onSelectionChange={(keys) => {
                            const val = Array.from(keys)[0] as string;
                            setFilters({ jobTitle: val });
                        }}
                    >
                        {[
                            { value: 'DOCTOR', label: 'Bác sĩ' },
                            { value: 'NURSE', label: 'Điều dưỡng' },
                            { value: 'TECHNICIAN', label: 'Kỹ thuật viên' },
                            { value: 'MIDWIFE', label: 'Hộ sinh' },
                            { value: 'PHYSICIAN_ASSISTANT', label: 'Y sĩ' },
                            { value: 'PHARMACIST', label: 'Dược sĩ' },
                            { value: 'RECEPTIONIST', label: 'Lễ tân' },
                            { value: 'MANAGEMENT', label: 'Quản trị' },
                        ].map(opt => (
                            <SelectItem key={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </Select>
                    <Select
                        placeholder="Trạng thái"
                        classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                        selectedKeys={filters.status ? [filters.status] : []}
                        onSelectionChange={(keys) => {
                            const val = Array.from(keys)[0] as string;
                            setFilters({ status: val });
                        }}
                    >
                        <SelectItem key="WORKING">Đang làm việc</SelectItem>
                        <SelectItem key="RESIGNED">Đã nghỉ</SelectItem>
                    </Select>
                    <Select
                        placeholder="Khoa"
                        isLoading={deptLoading}
                        classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                        selectedKeys={filters.departmentId ? [filters.departmentId] : []}
                        onSelectionChange={(keys) => {
                            const val = Array.from(keys)[0] as string;
                            setFilters({ departmentId: val, roomId: undefined });
                        }}
                    >
                        {departmentOptions.map((opt: any) => (
                            <SelectItem key={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </Select>
                    <Select
                        placeholder="Phòng"
                        isLoading={roomLoading}
                        classNames={{ trigger: 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10' }}
                        selectedKeys={filters.roomId ? [filters.roomId] : []}
                        onSelectionChange={(keys) => {
                            const val = Array.from(keys)[0] as string;
                            setFilters({ roomId: val });
                        }}
                    >
                        {roomOptions.map((opt: any) => (
                            <SelectItem key={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </Select>
                </div>

                {/* View Mode Components */}
                {viewMode === 'list' ? (
                    <StaffTable
                        data={staffData}
                        loading={isLoading}
                        page={page}
                        limit={limit}
                        total={total}
                        onPageChange={setPage}
                        onLimitChange={setLimit}
                        onViewDetail={handleViewDetail}
                    />
                ) : (
                    <StaffGrid
                        data={staffData}
                        loading={isLoading}
                        page={page}
                        limit={limit}
                        total={total}
                        onPageChange={setPage}
                        onLimitChange={setLimit}
                        onViewDetail={handleViewDetail}
                    />
                )}
            </div>
        </PageContainer>
    );
};
