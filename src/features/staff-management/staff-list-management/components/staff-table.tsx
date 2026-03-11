import type { FC } from 'react';
import { Chip, Switch, Button } from '@heroui/react';
import { IconMail, IconPencil, IconPhone } from '@tabler/icons-react';

import { DataTable, type ColumnDef } from '@/components/data-table/data-table';
import type { Staff } from '@/types/staff.type';
import { translateJobTitle, translatePosition } from '../../time-attendance-management/helpers';

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

const columns: ColumnDef<Staff>[] = [
    {
        key: 'name',
        title: 'NHÂN VIÊN',
        render: (_, record) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <img src={record.avatar || `https://ui-avatars.com/api/?name=${record.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                    <div className="font-semibold text-sm text-[#11181C] flex items-center gap-2">
                        {record.name}
                        {renderStatusChip(record.status as unknown as string)}
                    </div>
                    <div className="text-xs text-[#71717A] mt-0.5">
                        {translateJobTitle(record.jobTitle as any)} - {record.code}
                    </div>
                </div>
            </div>
        ),
    },
    {
        key: 'birthday',
        title: 'NGÀY SINH',
        render: (_, record) => (
            <span className="text-sm text-[#11181C]">{record?.birthday ? new Date(record?.birthday as string).toLocaleDateString('vi-VN') : ''}</span>
        ),
    },
    {
        key: 'gender',
        title: 'GIỚI TÍNH',
        render: (_, record) => (
            <span className="text-sm text-[#11181C]">{record?.gender === 'MALE' ? 'Nam' : record?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
        ),
    },
    {
        key: 'contact',
        title: 'LIÊN HỆ',
        render: (_, record) => (
            <div className="flex flex-col gap-0.5 text-sm text-[#006FEE]">
                <span className='flex gap-1.5'><IconMail size={20} color='#000000' stroke={"1px"} /> {record.email}</span>
                <span className='flex gap-1.5'><IconPhone size={20} color='#000000' stroke={"1px"} /> {record.phone}</span>
            </div>
        ),
    },
    {
        key: 'jobTitle',
        title: 'CHỨC DANH',
        render: (_, record) => (
            <span className="text-sm text-[#11181C]">{translateJobTitle(record?.jobTitle as any)}</span>
        ),
    },
    {
        key: 'position',
        title: 'CẤP BẬC',
        render: (_, record) => (
            <span className="text-sm text-[#11181C]">{translatePosition(record?.position as string)}</span>
        ),
    },
    {
        key: 'departments',
        title: 'KHOA/PHÒNG',
        render: (_, record) => (
            <span className="text-sm text-[#11181C]">
                {Array.isArray(record?.departments) ? (record?.departments as { id: string; name: string }[]).map((d) => d.name).join(', ') : '—'}
            </span>
        ),
    },
    {
        key: 'workType',
        title: 'LOẠI HÌNH',
        render: (_, record) => (
            <span className="text-sm text-[#11181C]">
                {record?.workType === 'FULL_TIME' ? 'Toàn thời gian' : record?.workType === 'PART_TIME' ? 'Bán thời gian' : (record?.workType as string) || '—'}
            </span>
        ),
    },
    {
        key: 'endDate',
        title: 'NGÀY HẾT HẠN HĐ',
        render: (_, record) => (
            <span className="text-sm text-[#11181C]">{record?.endDate ? new Date(record?.endDate as string).toLocaleDateString('vi-VN') : '—'}</span>
        ),
    },
    {
        key: 'actions',
        title: 'HÀNH ĐỘNG',
        render: (_, record) => (
            <div className="flex items-center gap-3">
                <Switch size="sm" isSelected={record.activeStatus === 'ACTIVE'} />
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-[#71717A]"
                    onClick={() => record.id}
                >
                    <IconPencil size={18} stroke={1.5} />
                </Button>
            </div>
        ),
    },
];

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

    // Update the actions column to include the edit handler
    const columnsWithHandlers: ColumnDef<Staff>[] = columns.map((col) => {
        if (col.key === 'actions') {
            return {
                ...col,
                render: (_: unknown, record: Staff) => (
                    <div className="flex items-center gap-3">
                        <Switch size="sm" isSelected={record.activeStatus === 'ACTIVE'} />
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-[#71717A]"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(record);
                            }}
                        >
                            <IconPencil size={18} stroke={1.5} />
                        </Button>
                    </div>
                ),
            };
        }
        return col;
    });

    if (loading) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-white shadow-sm border border-[#E4E4E7] rounded-xl overflow-hidden mt-4 items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        // <div className="p-4 bg-white flex-1 overflow-auto">
            <DataTable
                selectionMode='single'
                columns={columnsWithHandlers}
                dataSource={data}
                loading={loading}
                emptyContent="Không có dữ liệu"
                pagination={{
                    current: page,
                    pageSize: limit,
                    total: total,
                    totalPage: totalPages,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 25, 50, 100],
                    onChange: (page, pageSize) => {
                        onPageChange(page);
                        onLimitChange(pageSize);
                    },
                }}
                classNames={{ wrapper: 'h-[calc(100vh-315px)]' }}
                onRowClick={(record) => onViewDetail?.(record.id)}
            />
        // </div>
    );
};
