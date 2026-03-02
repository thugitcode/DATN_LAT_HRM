import type { FC } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Chip,
    Switch,
    Button,
    Pagination,
    Select,
    SelectItem,
} from '@heroui/react';
import { IconPencil } from '@tabler/icons-react';

import type { Staff } from '@/types/staff.type';

const translateJobTitle = (title: string) => {
    const titles: Record<string, string> = {
        'DOCTOR': 'Bác sĩ',
        'NURSE': 'Điều dưỡng',
        'TECHNICIAN': 'Kỹ thuật viên',
        'MIDWIFE': 'Hộ sinh',
        'PHYSICIAN_ASSISTANT': 'Y sĩ',
        'OFFICE_STAFF': 'Nhân viên văn phòng',
        'MANAGEMENT': 'Quản lý',
        'LAB_TECHNICIAN': 'Kỹ thuật viên xét nghiệm',
        'IMAGING_TECHNICIAN': 'Kỹ thuật viên chẩn đoán hình ảnh',
        'CASHIER': 'Thu ngân',
        'RECEPTIONIST': 'Lễ tân',
        'WAREHOUSE_KEEPER': 'Thủ kho',
        'PHARMACIST': 'Dược sĩ',
        'SALES': 'Sale',
        'TELESALES': 'Telesale',
        'MARKETING': 'Marketing',
        'CUSTOMER_SUPPORT': 'Chăm sóc khách hàng',
        'MARKETING_LEAD': 'Trưởng nhóm marketing',
        'CUSTOMER_SUPPORT_LEAD': 'Trưởng nhóm CSKH',
    };
    return titles[title] || title || '—';
};

const translatePosition = (position: string) => {
    const positions: Record<string, string> = {
        'STAFF': 'Nhân viên',
        'HEAD_OF_DEPARTMENT': 'Trưởng khoa',
        'DEPUTY_HEAD_OF_DEPARTMENT': 'Phó khoa',
        'CHIEF_NURSE': 'Điều dưỡng trưởng',
        'MANAGER': 'Trưởng phòng',
        'HEAD_OF_UNIT': 'Trưởng bộ phận',
        'DEPUTY_MANAGER': 'Phó phòng',
    };
    return positions[position] || position || '—';
};

const renderStatusChip = (status?: string) => {
    switch (status) {
        case 'WORKING':
            return <Chip size="sm" color="success" classNames={{ content: 'text-[#17C964] font-medium text-[10px] px-1', base: 'h-5 bg-[#E8FAF0]' }}>Đang làm việc</Chip>;
        case 'RESIGNED':
            return <Chip size="sm" classNames={{ content: 'text-[#71717A] font-medium text-[10px] px-1', base: 'h-5 bg-[#F4F4F5]' }}>Nghỉ</Chip>;
        case 'PENDING':
            return <Chip size="sm" color="warning" classNames={{ content: 'text-[#F5A524] font-medium text-[10px] px-1', base: 'h-5 bg-[#FEFCE8]' }}>Chờ duyệt</Chip>;
        default:
            return <Chip size="sm" classNames={{ content: 'text-[#71717A] font-medium text-[10px] px-1', base: 'h-5 bg-[#F4F4F5]' }}>Không rõ</Chip>;
    }
};

interface StaffTableProps {
    data: Staff[];
    loading?: boolean;
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onViewDetail?: (id: string) => void;
    onEdit?: (staff: Staff) => void;
}

export const StaffTable: FC<StaffTableProps> = ({
    data,
    loading,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    onViewDetail,
    onEdit,
}) => {
    const totalPages = Math.ceil((total || 1) / limit);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-white shadow-sm border border-[#E4E4E7] rounded-xl overflow-hidden mt-4 items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-sm border border-[#E4E4E7] rounded-xl overflow-hidden mt-4">
            <div className="flex-1 overflow-auto">
                <Table
                    aria-label="Staff list block"
                    classNames={{
                        wrapper: 'shadow-none p-0',
                        th: 'bg-[#F4F4F5] text-[#71717A] text-xs font-semibold uppercase py-3 px-4 first:rounded-tl-lg last:rounded-tr-lg border-b border-[#E4E4E7]',
                        td: 'py-3 px-4',
                        tr: 'border-b border-[#F4F4F5] last:border-none hover:bg-[#FAFAFA] transition-colors cursor-pointer',
                    }}
                    onRowAction={(key) => onViewDetail?.(key as string)}
                    removeWrapper
                >
                    <TableHeader>
                        {/* previous columns */}
                        <TableColumn>NHÂN VIÊN</TableColumn>
                        <TableColumn>NGÀY SINH</TableColumn>
                        <TableColumn>GIỚI TÍNH</TableColumn>
                        <TableColumn>LIÊN HỆ</TableColumn>
                        <TableColumn>CHỨC DANH</TableColumn>
                        <TableColumn>CẤP BẬC</TableColumn>
                        <TableColumn>KHOA/PHÒNG</TableColumn>
                        <TableColumn>LOẠI HÌNH</TableColumn>
                        <TableColumn>NGÀY HẾT HẠN HĐ</TableColumn>
                        <TableColumn>HÀNH ĐỘNG</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Không có dữ liệu"}>
                        {data.map((staff) => (
                            <TableRow
                                key={staff.id}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                            <img src={staff.avatar || `https://ui-avatars.com/api/?name=${staff.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-[#11181C] flex items-center gap-2">
                                                {staff.name}
                                                {renderStatusChip(staff.status as unknown as string)}
                                            </div>
                                            <div className="text-xs text-[#71717A] mt-0.5">
                                                {translateJobTitle(staff.jobTitle as any)} - {staff.code}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-[#11181C]">{staff.birthday ? new Date(staff.birthday).toLocaleDateString('vi-VN') : ''}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-[#11181C]">{staff.gender === 'MALE' ? 'Nam' : staff.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5 text-sm text-[#006FEE]">
                                        <span>📧 {staff.email}</span>
                                        <span>📞 {staff.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-[#11181C]">{translateJobTitle(staff.jobTitle as any)}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-[#11181C]">{translatePosition(staff.position as string)}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-[#11181C]">{staff.departments?.map((d: { id: string; name: string }) => d.name).join(', ') || '—'}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-[#11181C]">{staff.workType === 'FULL_TIME' ? 'Toàn thời gian' : staff.workType === 'PART_TIME' ? 'Bán thời gian' : (staff.workType || '—')}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-[#11181C]">{staff.endDate ? new Date(staff.endDate).toLocaleDateString('vi-VN') : '—'}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Switch size="sm" isSelected={staff.activeStatus === 'ACTIVE'} />
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            className="text-[#71717A]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit?.(staff);
                                            }}
                                        >
                                            <IconPencil size={18} stroke={1.5} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination block */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#F4F4F5] bg-white mt-auto">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#71717A]">Page</span>
                    <Select
                        size="sm"
                        variant="bordered"
                        selectedKeys={[limit.toString()]}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            onLimitChange(Number(value));
                        }}
                        className="w-[70px]"
                        classNames={{
                            trigger: 'h-8 min-h-8 rounded-lg',
                        }}
                    >
                        <SelectItem key="10">10</SelectItem>
                        <SelectItem key="25">25</SelectItem>
                        <SelectItem key="50">50</SelectItem>
                        <SelectItem key="100">100</SelectItem>
                    </Select>
                    <span className="text-sm text-[#71717A]">
                        of {totalPages}
                    </span>
                </div>

                <Pagination
                    total={totalPages || 1}
                    page={page}
                    onChange={onPageChange}
                    showControls
                    size="sm"
                    classNames={{
                        cursor: 'bg-[#006FEE] text-white',
                    }}
                />
            </div>
        </div>
    );
};
