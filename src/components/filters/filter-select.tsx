import { useCallback } from 'react';
import { Select, SelectItem } from '@heroui/react';

export interface SelectOption {
  key: string;
  label: string;
}

interface FilterSelectProps {
  options: readonly SelectOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  label,
  className = '',
}) => {
  const handleSelectionChange = useCallback(
    (keys: 'all' | Set<React.Key>) => {
      if (keys === 'all') return;
      const selected = Array.from(keys)[0];
      onChange(selected ? String(selected) : undefined);
    },
    [onChange],
  );

  return (
    <Select
      label={label}
      placeholder={placeholder}
      size="sm"
      variant="flat"
      selectedKeys={value ? [value] : []}
      onSelectionChange={handleSelectionChange}
      className={className}
      classNames={{
        trigger: 'bg-white border-none shadow-none !rounded-[12px] px-3 h-[46px] min-h-[46px]',
        value: 'text-black',
        label: 'text-black',
        popoverContent: 'bg-white rounded-[12px]',
        listbox: 'bg-white',
      }}
      aria-label={label || placeholder}
    >
      {options.map((option) => (
        <SelectItem key={option.key}>{option.label}</SelectItem>
      ))}
    </Select>
  );
};
