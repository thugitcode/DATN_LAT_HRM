// components/form/FormCheckbox.tsx
import type { FC } from 'react';
import { useController, type Control } from 'react-hook-form';
import { Checkbox } from '@heroui/react';

interface FormCheckboxProps {
  control: Control<any>;
  name: string;
  label: string;
  disabled?: boolean;
  classNames?: any;
}

export const FormCheckbox: FC<FormCheckboxProps> = ({
  control,
  name,
  label,
  disabled,
  classNames,
}) => {
  const { field } = useController({ control, name });

  return (
    <Checkbox
      isSelected={field.value ?? false}
      onValueChange={field.onChange}
      isDisabled={disabled}
      classNames={{
        label: 'text-sm font-semibold text-[#11181C]',
        ...classNames,
      }}
    >
      {label}
    </Checkbox>
  );
};