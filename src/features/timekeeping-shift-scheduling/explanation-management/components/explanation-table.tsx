import type { FC } from 'react';
import {
    Button,
    Checkbox,
    Pagination,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Chip,
    Spinner,
} from '@heroui/react';
import { IconFileText, IconX } from '@tabler/icons-react';

import type { ExplanationRecord } from '../types';

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

interface ExplanationTableProps {
    data: ExplanationRecord[];
    loading?: boolean;
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    selectedRecords: ExplanationRecord[];
    onSelectionChange: (records: ExplanationRecord[]) => void;
    onRefresh?: () => void;
}

export const ExplanationTable: FC<ExplanationTableProps> = ({
    data,
    loading = false,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    selectedRecords,
    onSelectionChange,
}) => {
    const totalPages = Math.ceil(total / limit);

    const renderStatus = (status: ExplanationRecord['status']) => {
        const statusUpper = status.toUpperCase();
        if (statusUpper === 'PENDING' || statusUpper === 'PENDING_HR') {
            return (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        isIconOnly
                        className="rounded-lg h-8 w-8 min-w-8"
                        title="Từ chối"
                    >
                        <IconX size={16} />
                    </Button>
                    <Button
                        size="sm"
                        color="primary"
                        className="rounded-lg font-medium h-8 px-3 text-xs"
                    >
                        Xác nhận
                    </Button>
                </div>
            );
        }

        if (statusUpper === 'APPROVED') {
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    color="success"
                    className="text-xs"
                    startContent={
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6" cy="6" r="6" fill="#17C964" />
                            <path d="M4 6L5.5 7.5L8 4.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                >
                    Đã xác nhận
                </Chip>
            );
        }

        if (statusUpper === 'REJECTED') {
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="text-xs"
                    startContent={
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6" cy="6" r="6" fill="#F31260" />
                            <path d="M4.5 4.5L7.5 7.5M7.5 4.5L4.5 7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    }
                >
                    Từ chối
                </Chip>
            );
        }

        return null;
    };

    const handleSelectionChange = (record: ExplanationRecord) => {
        const isSelected = selectedRecords.some((r) => r.id === record.id);
        if (isSelected) {
            onSelectionChange(selectedRecords.filter((r) => r.id !== record.id));
        } else {
            onSelectionChange([...selectedRecords, record]);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(data);
        } else {
            onSelectionChange([]);
        }
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden">
            <Table
                aria-label="Bảng giải trình ca"
                classNames={{
                    wrapper: 'shadow-none p-4',
                    th: 'text-[#71717A] text-xs font-semibold uppercase py-3 first:rounded-l-lg last:rounded-r-lg',
                    td: 'py-3 text-sm',
                    tr: 'border-b border-[#F4F4F5] last:border-none hover:bg-[#FAFAFA] transition-colors',
                }}
            >
                <TableHeader>
                    <TableColumn width={50}>
                        <Checkbox
                            size="sm"
                            isSelected={data.length > 0 && selectedRecords.length === data.length}
                            onValueChange={handleSelectAll}
                        />
                    </TableColumn>
                    <TableColumn>KHOA/PHÒNG</TableColumn>
                    <TableColumn>MÃ NHÂN VIÊN</TableColumn>
                    <TableColumn>TÊN NHÂN VIÊN</TableColumn>
                    <TableColumn>CHỨC VỤ</TableColumn>
                    <TableColumn>NGÀY</TableColumn>
                    <TableColumn>LOẠI LỖI</TableColumn>
                    <TableColumn>GIẢI TRÌNH</TableColumn>
                    <TableColumn>FILE ĐÍNH KÈM</TableColumn>
                    <TableColumn>QUẢN LÝ QUYẾT</TableColumn>
                    <TableColumn>HÀNH ĐỘNG</TableColumn>
                </TableHeader>
                <TableBody
                // emptyContent={loading ? <Spinner size="sm" /> : 'Không có dữ liệu'}
                // isLoading={loading}
                >
                    {data.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>
                                <Checkbox
                                    size="sm"
                                    isSelected={selectedRecords.some((r) => r.id === record.id)}
                                    onValueChange={() => handleSelectionChange(record)}
                                />
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.departmentName || record.roomName || '-'}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.staffCode}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.staffName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.position || '-'}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{formatDate(record.date)}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.typeLabel}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.reason}</span>
                            </TableCell>
                            <TableCell>
                                {record.firstAttachmentName ? (
                                    <button className="flex items-center gap-1 text-[#006FEE] hover:underline text-sm">
                                        <IconFileText size={16} />
                                        <span>{record.firstAttachmentName}</span>
                                        {record.attachmentCount > 1 && (
                                            <span className="text-xs text-[#71717A]">
                                                (+{record.attachmentCount - 1})
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <span className="text-sm text-[#71717A]">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">
                                    {record.approvedByManagerName || '-'}
                                </span>
                            </TableCell>
                            <TableCell>{renderStatus(record.status)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#F4F4F5]">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#71717A]">Hiển thị</span>
                    <Select
                        size="sm"
                        variant="bordered"
                        selectedKeys={[limit.toString()]}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            onLimitChange(Number(value));
                        }}
                        className="w-20"
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
                        trên tổng {total} bản ghi
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
