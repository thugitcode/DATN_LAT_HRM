import { useEffect, useState } from 'react';
import { Input, Select, SelectItem, Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react';
import { IconCalendar } from '@tabler/icons-react';

import { icons } from '@/lib/icons';
import type { AttendanceExplanationFilters } from '@/types/attendance-explanation.type';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';

import { statusOptions } from '../constants/data';

interface ExplanationFilterProps {
    filters: AttendanceExplanationFilters;
    onFiltersChange: (filters: AttendanceExplanationFilters) => void;
}

export const ExplanationFilter = ({
    filters,
    onFiltersChange,
}: ExplanationFilterProps) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    const [tempFromDate, setTempFromDate] = useState(filters.fromDate || '');
    const [tempToDate, setTempToDate] = useState(filters.toDate || '');

    const { options: departmentOptions } = useDepartmentOptions();
    const { options: roomOptions } = useRoomOptions(localFilters.departmentId);

    // Reset roomId when departmentId changes
    useEffect(() => {
        if (localFilters.departmentId !== filters.departmentId) {
            setLocalFilters((prev) => ({ ...prev, roomId: undefined }));
        }
    }, [localFilters.departmentId, filters.departmentId]);

    const handleFilterChange = (key: keyof AttendanceExplanationFilters, value: any) => {
        let finalValue = value;
        if (key === 'status' && value === 'ALL') {
            finalValue = undefined;
        }
        const newFilters = { ...localFilters, [key]: finalValue || undefined };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleApplyDateRange = () => {
        const newFilters = {
            ...localFilters,
            fromDate: tempFromDate || undefined,
            toDate: tempToDate || undefined
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
        setIsDateRangeOpen(false);
    };

    const formatDateDisplay = (date: string | undefined) => {
        if (!date) return '';
        // Format YYYY-MM-DD to DD/MM/YYYY
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    const getDateRangeText = () => {
        if (localFilters.fromDate && localFilters.toDate) {
            return `${formatDateDisplay(localFilters.fromDate)} - ${formatDateDisplay(localFilters.toDate)}`;
        } else if (localFilters.fromDate) {
            return `Từ ${formatDateDisplay(localFilters.fromDate)}`;
        } else if (localFilters.toDate) {
            return `Đến ${formatDateDisplay(localFilters.toDate)}`;
        }
        return 'Chọn khoảng thời gian';
    };

    return (
        <div className="flex items-center gap-3">
            {/* Date Range Picker - Single Input */}
            <Popover
                isOpen={isDateRangeOpen}
                onOpenChange={setIsDateRangeOpen}
                placement="bottom-start"
            >
                <PopoverTrigger>
                    <div
                        className="flex items-center gap-2 h-[46px] min-w-[260px] px-3 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <IconCalendar size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-600 flex-1">
                            {getDateRangeText()}
                        </span>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="p-4">
                    <div className="flex flex-col gap-3 w-[320px]">
                        <h4 className="text-sm font-semibold text-gray-700">Chọn khoảng thời gian</h4>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Từ ngày</label>
                            <Input
                                type="date"
                                variant="bordered"
                                value={tempFromDate}
                                onValueChange={setTempFromDate}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Đến ngày</label>
                            <Input
                                type="date"
                                variant="bordered"
                                value={tempToDate}
                                onValueChange={setTempToDate}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="flat"
                                size="sm"
                                className="flex-1"
                                onPress={() => {
                                    setTempFromDate('');
                                    setTempToDate('');
                                }}
                            >
                                Xóa
                            </Button>
                            <Button
                                color="primary"
                                size="sm"
                                className="flex-1"
                                onPress={handleApplyDateRange}
                            >
                                Áp dụng
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Search */}
            <Input
                placeholder="Tìm kiếm"
                variant="flat"
                value={localFilters.search || ''}
                onValueChange={(value) => handleFilterChange('search', value)}
                startContent={icons.search}
                classNames={{
                    inputWrapper: `
            h-[46px]
            min-h-[46px]
            bg-white
            border-none
            shadow-none
          `,
                    input: 'text-black',
                }}
            />

            {/* Status Select */}
            <Select
                placeholder="Trạng thái"
                size="sm"
                variant="flat"
                selectedKeys={localFilters.status ? [localFilters.status] : []}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleFilterChange('status', value);
                }}
                classNames={{
                    trigger: 'bg-white border-none shadow-none !rounded-[12px] px-3 h-[46px] min-h-[46px]',
                    value: 'text-black',
                    label: 'text-black',
                    popoverContent: 'bg-white rounded-[12px]',
                    listbox: 'bg-white',
                }}
            >
                {statusOptions.map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
            </Select>

            {/* Khoa Select */}
            <Select
                placeholder="Khoa"
                size="sm"
                variant="flat"
                selectedKeys={localFilters.departmentId ? [localFilters.departmentId] : []}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleFilterChange('departmentId', value);
                }}
                classNames={{
                    trigger: 'bg-white border-none shadow-none !rounded-[12px] px-3 h-[46px] min-h-[46px]',
                    value: 'text-black',
                    label: 'text-black',
                    popoverContent: 'bg-white rounded-[12px]',
                    listbox: 'bg-white',
                }}
            >
                {departmentOptions.map((dept: any) => (
                    <SelectItem key={dept.value}>{dept.label}</SelectItem>
                ))}
            </Select>

            {/* Phòng Select */}
            <Select
                placeholder="Phòng"
                size="sm"
                variant="flat"
                selectedKeys={localFilters.roomId ? [localFilters.roomId] : []}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleFilterChange('roomId', value);
                }}
                classNames={{
                    trigger: 'bg-white border-none shadow-none !rounded-[12px] px-3 h-[46px] min-h-[46px]',
                    value: 'text-black',
                    label: 'text-black',
                    popoverContent: 'bg-white rounded-[12px]',
                    listbox: 'bg-white',
                }}
            >
                {roomOptions.map((room: any) => (
                    <SelectItem key={room.value}>{room.label}</SelectItem>
                ))}
            </Select>
        </div>
    );
};
