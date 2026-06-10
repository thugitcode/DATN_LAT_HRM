import { useCallback, useEffect, useRef, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  startIcon?: React.ReactNode;
  className?: string;
  debounceMs?: number;
}

const INPUT_WRAPPER_CLASSES = '!bg-white border-none shadow-none h-9 min-h-9';

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  startIcon,
  className = '',
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value ?? '');
  const { t } = useTranslation(NAMESPACES.COMMON);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalValue(value ?? '');
  }, [value]);

  const handleValueChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        // onChangeRef.current(newValue || undefined);
      }, debounceMs);
    },
    [debounceMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  const handleKeyDown = (keyCode: number) => {
    const ENTER_KEYCODE = 13;
    if (keyCode === ENTER_KEYCODE) {
      onChangeRef.current(localValue);
    }
  };
  return (
    <Input
      onKeyDown={({ keyCode }) => handleKeyDown(keyCode)}
      placeholder={placeholder ?? t('actions.search')}
      variant="flat"
      startContent={startIcon}
      value={localValue}
      onValueChange={handleValueChange}
      className={className}
      classNames={{
        inputWrapper: INPUT_WRAPPER_CLASSES,
        input: 'text-black',
        base: '[&>div]:focus-within:ring-0 [&>div]:focus-within:ring-offset-0',
      }}
      aria-label={placeholder}
      isClearable
      onClear={() => onChangeRef.current('')}
    />
  );
};
