// components/form/FormCheckboxGroup.tsx
import type { FC } from 'react';
import { Checkbox } from '@heroui/react';
import { useController, type Control } from 'react-hook-form';

import type { Options } from '@/types/global.type';
import { cn } from '@/lib/utils';

interface FormCheckboxGroupProps {
  control: Control<any>;
  name: string;
  options: Options[];
  disabled?: boolean;
  className?: string;
  transform?: (key: string) => unknown;
}

export const FormCheckboxGroup: FC<FormCheckboxGroupProps> = ({
  control,
  name,
  options,
  disabled,
  className,
  transform,
}) => {
  const { field } = useController({ control, name });

  const toValue = (key: string) => (transform ? transform(key) : key);

  const handleChange = (key: string, checked: boolean) => {
    const value = toValue(key);
    let current = Array.isArray(field.value) ? [...field.value] : [];
    if (checked) {
      if (!current.some((v) => String(v) === String(value))) current.push(value);
    } else {
      current = current.filter((v) => String(v) !== String(value));
    }
    field.onChange(current);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {options.map((opt) => (
        <Checkbox
          key={opt.key}
          isSelected={Array.isArray(field.value) && field.value.some((v: unknown) => String(v) === String(toValue(opt.key)))}
          onValueChange={(checked) => handleChange(opt.key, checked)}
          isDisabled={disabled}
          classNames={{ label: 'text-[14px] text-[#3F3F46]' }}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );
};
