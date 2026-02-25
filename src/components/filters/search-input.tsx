import { useCallback } from 'react';
import { Input } from '@heroui/react';

interface SearchInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  startIcon?: React.ReactNode;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  startIcon,
  className = '',
}) => {
  const handleValueChange = useCallback(
    (newValue: string) => {
      onChange(newValue || undefined);
    },
    [onChange],
  );

  return (
    <Input
      placeholder={placeholder}
      variant="flat"
      startContent={startIcon}
      value={value ?? ''}
      onValueChange={handleValueChange}
      className={className}
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
      aria-label={placeholder}
    />
  );
};
