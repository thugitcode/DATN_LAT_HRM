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
}

export const FormCheckboxGroup: FC<FormCheckboxGroupProps> = ({
  control,
  name,
  options,
  disabled,
  className,
}) => {
  const { field } = useController({ control, name });

  const handleChange = (value: string, checked: boolean) => {
    let current = Array.isArray(field.value) ? [...field.value] : [];
    if (checked) {
      if (!current.includes(value)) current.push(value);
    } else {
      current = current.filter((v) => v !== value);
    }
    field.onChange(current);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {options.map((opt) => (
        <Checkbox
          key={opt.key}
          isSelected={Array.isArray(field.value) && field.value.includes(opt.key)}
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
