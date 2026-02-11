import { useState } from 'react';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import {
    IconChevronLeft,
    IconChevronRight,
} from '@tabler/icons-react';

import { icons } from '@/lib/icons';

import { statusOptions } from '../constants/data';

const animals = [
    { key: 'cat', label: 'Cat' },
    { key: 'dog', label: 'Dog' },
    { key: 'elephant', label: 'Elephant' },
];

export const ExplanationFilter = () => {
    const [currentMonth] = useState('Tháng 1/2026');

    return (
        <div className="flex items-center gap-3">
            {/* Month Picker */}
            <div className="flex items-center gap-1 bg-white rounded-xl px-3 h-[46px] min-w-[170px]">
                <Button isIconOnly size="sm" variant="light" className="min-w-6 w-6 h-6">
                    <IconChevronLeft size={16} />
                </Button>
                <span className="text-sm font-medium whitespace-nowrap flex-1 text-center">
                    {currentMonth}
                </span>
                <Button isIconOnly size="sm" variant="light" className="min-w-6 w-6 h-6">
                    <IconChevronRight size={16} />
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Tìm kiếm"
                variant="flat"
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
                classNames={{
                    trigger: 'bg-white border-none shadow-none !rounded-[12px] px-3 h-[46px] min-h-[46px]',
                    value: 'text-black',
                    label: 'text-black',
                    popoverContent: 'bg-white rounded-[12px]',
                    listbox: 'bg-white',
                }}
            >
                {animals.map((animal) => (
                    <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
            </Select>

            {/* Phòng Select */}
            <Select
                placeholder="Phòng"
                size="sm"
                variant="flat"
                classNames={{
                    trigger: 'bg-white border-none shadow-none !rounded-[12px] px-3 h-[46px] min-h-[46px]',
                    value: 'text-black',
                    label: 'text-black',
                    popoverContent: 'bg-white rounded-[12px]',
                    listbox: 'bg-white',
                }}
            >
                {animals.map((animal) => (
                    <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
            </Select>
        </div>
    );
};
