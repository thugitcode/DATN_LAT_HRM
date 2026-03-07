// components/form/FormCheckboxGroup.tsx
import type { FC } from 'react';
import { useController, type Control } from 'react-hook-form';
import { Checkbox } from '@heroui/react';

interface Option {
  value: string;
  label: string;
}

interface FormCheckboxGroupProps {
  control: Control<any>;
  name: string;
  options: Option[];
  disabled?: boolean;
}

export const FormCheckboxGroup: FC<FormCheckboxGroupProps> = ({
  control,
  name,
  options,
  disabled,
}) => {
  const { field } = useController({ control, name });

  const handleChange = (value: string, checked: boolean) => {
    let current = Array.isArray(field.value) ? [...field.value] : [];
    if (checked) {
      if (!current.includes(value)) current.push(value);
    } else {
      current = current.filter(v => v !== value);
    }
    field.onChange(current);
  };

  return (
    <div className="flex flex-col gap-4">
      {options.map(opt => (
        <Checkbox
          key={opt.value}
          isSelected={Array.isArray(field.value) && field.value.includes(opt.value)}
          onValueChange={checked => handleChange(opt.value, checked)}
          isDisabled={disabled}
          classNames={{ label: 'text-[14px] text-[#3F3F46]' }}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );
};