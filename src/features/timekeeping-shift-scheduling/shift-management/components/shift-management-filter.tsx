import { DatePicker, Input, Select, SelectItem } from '@heroui/react';

import { icons } from '@/lib/icons';

const animals = [
  { key: 'cat', label: 'Cat' },
  { key: 'dog', label: 'Dog' },
  { key: 'elephant', label: 'Elephant' },
  { key: 'lion', label: 'Lion' },
  { key: 'tiger', label: 'Tiger' },
  { key: 'giraffe', label: 'Giraffe' },
  { key: 'dolphin', label: 'Dolphin' },
  { key: 'penguin', label: 'Penguin' },
  { key: 'zebra', label: 'Zebra' },
  { key: 'shark', label: 'Shark' },
  { key: 'whale', label: 'Whale' },
  { key: 'otter', label: 'Otter' },
  { key: 'crocodile', label: 'Crocodile' },
];

export const ShiftManagementFilter = () => {
  return (
    <div className="flex items-center gap-3 justify-between">
      <DatePicker
        granularity="day"
        variant="flat"
        classNames={{
          base: 'h-[46px]',
          inputWrapper: 'bg-white border-none shadow-none',
        }}
      />

      <Input
        placeholder="Tìm kiếm..."
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

      <Select
        // label="Khoa"
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
