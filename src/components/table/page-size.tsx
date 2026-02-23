import { Select, SelectItem } from '@heroui/react';

const pageSizeOption = [
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '5' },
  { key: '4', label: '4' },
];

export const PageSize = () => {
  return (
    <div className="flex items-center gap-2.5 font-semibold text-[14px] text-[#333333] D]">
      <span>Page</span>
      <Select
        className="w-17.5"
        classNames={{
          trigger:
            'bg-white !border !border-[#DDDDD] shadow-none !rounded-[8px] px-3 h-[42px] min-h-[46px]',
          value: 'text-black',
          label: 'text-black',
          popoverContent: 'bg-white rounded-[12px] w-[68px]',
          listbox: 'bg-white',
        }}
      >
        {pageSizeOption.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>

      <span className="text-nowrap">of 10</span>
    </div>
  );
};
