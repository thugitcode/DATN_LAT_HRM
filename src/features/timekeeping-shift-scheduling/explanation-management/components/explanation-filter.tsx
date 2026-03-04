import { useCallback, useEffect, useState } from 'react';
import { Input, Select, SelectItem, Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react';
import { IconCalendar } from '@tabler/icons-react';

import { icons } from '@/lib/icons';
import type { AttendanceExplanationFilters } from '@/types/attendance-explanation.type';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';

import { statusOptions } from '../constants/data';
import { MonthFilter } from '@/components/filters/month-filter';
import { SearchInput } from '@/components/filters/search-input';

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
    const handleMonthChange = useCallback(
        (value: string) => {
            const newFilters = {
                ...localFilters,
                month: value
            };
            setLocalFilters(pre => { return { ...pre, month: value } });
            onFiltersChange(newFilters);
        },
        [setLocalFilters],
    );
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
            <MonthFilter value={filters.month} onChange={handleMonthChange} />

            {/* Search */}
            <SearchInput value={filters.search} onChange={(value) => onFiltersChange({ ...localFilters, search: value })} startIcon={icons.search} />

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
