import { useState } from 'react';
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
} from '@heroui/react';
import { IconFileText, IconX } from '@tabler/icons-react';

import type { ExplanationRecord } from '../types';

interface ExplanationTableProps {
    data: ExplanationRecord[];
}

export const ExplanationTable = ({ data }: ExplanationTableProps) => {
    const [page, setPage] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const totalPages = 10;

    const renderStatus = (status: ExplanationRecord['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            color="primary"
                            className="rounded-lg font-medium h-8 px-3 text-xs"
                        >
                            Xác nhận
                        </Button>
                    </div>
                );
            case 'approved':
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
            case 'rejected':
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
    };

    const handleSelectionChange = (id: string) => {
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden">
            <Table
                aria-label="Bảng giải trình ca"
                classNames={{
                    wrapper: 'shadow-none p-0',
                    th: 'bg-[#F4F4F5] text-[#71717A] text-xs font-semibold uppercase py-3 first:rounded-none last:rounded-none',
                    td: 'py-3 text-sm',
                    tr: 'border-b border-[#F4F4F5] last:border-none hover:bg-[#FAFAFA] transition-colors',
                }}
            >
                <TableHeader>
                    <TableColumn width={50}>
                        <Checkbox
                            size="sm"
                            isSelected={selectedKeys.size === data.length && data.length > 0}
                            onValueChange={(checked) => {
                                if (checked) {
                                    setSelectedKeys(new Set(data.map((d) => d.id)));
                                } else {
                                    setSelectedKeys(new Set());
                                }
                            }}
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
                <TableBody>
                    {data.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>
                                <Checkbox
                                    size="sm"
                                    isSelected={selectedKeys.has(record.id)}
                                    onValueChange={() => handleSelectionChange(record.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.departmentName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.employeeCode}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.employeeName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.position}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.date}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.errorType}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-[#11181C]">{record.explanation}</span>
                            </TableCell>
                            <TableCell>
                                <button className="flex items-center gap-1 text-[#006FEE] hover:underline text-sm">
                                    <IconFileText size={16} />
                                    <span>{record.attachmentName}</span>
                                </button>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[#11181C]">{record.approverName}</span>
                                    {record.status === 'pending' && (
                                        <button className="text-[#F31260] hover:opacity-80">
                                            <IconX size={16} />
                                        </button>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{renderStatus(record.status)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#F4F4F5]">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#71717A]">Page</span>
                    <Select
                        size="sm"
                        variant="bordered"
                        defaultSelectedKeys={['1']}
                        className="w-16"
                        classNames={{
                            trigger: 'h-8 min-h-8 rounded-lg',
                        }}
                    >
                        <SelectItem key="1">1</SelectItem>
                        <SelectItem key="2">2</SelectItem>
                        <SelectItem key="5">5</SelectItem>
                    </Select>
                    <span className="text-sm text-[#71717A]">of {totalPages}</span>
                </div>

                <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
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
