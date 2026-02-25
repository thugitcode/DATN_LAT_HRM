import { Select, SelectItem, type SharedSelection } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import { FormErrorText } from './form-error-text';
import { FormLabel } from './form-label';
import type { BaseFieldProps } from './types';

type Option = { key: string; label: string };

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  options: Option[];
  placeholder?: string;

  onSelect?: (key: string) => void;
};
export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  isRequired,
  disabled,
  placeholder,
  onSelect,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <FormLabel label={label} isRequired={isRequired} isError={!!fieldState.error} />

          <Select
            isDisabled={disabled}
            selectedKeys={field.value ? [field.value] : []}
            onSelectionChange={(keys) => {
              const selectedKey = [...keys][0] as string;
              field.onChange(selectedKey);

              field.onChange([...keys][0]);
              if (selectedKey !== undefined) {
                onSelect?.(selectedKey);
              }
            }}
            placeholder={placeholder ?? 'Chọn'}
          >
            {options.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>

          {fieldState.error && <FormErrorText errorMessage={fieldState.error.message} />}
        </div>
      )}
    />
  );
}
