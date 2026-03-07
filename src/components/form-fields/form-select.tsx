import { Chip, Select, SelectItem, type SelectionMode, type SelectProps, type SharedSelection } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import { FormErrorText } from './form-error-text';
import { FormLabel } from './form-label';
import type { BaseFieldProps } from './types';

type Option = { key: string; label: string };

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  options: Option[];
  placeholder?: string;
  onSelect?: (key: string | string[]) => void;
  selectionMode?: SelectionMode;
} & Partial<SelectProps<T>>;

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  isRequired,
  disabled,
  placeholder,
  onSelect,
  selectionMode = 'single',
  ...props
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <FormLabel label={label} isRequired={isRequired} isError={!!fieldState.error} />

          <Select
            selectionMode={selectionMode}
            isDisabled={disabled}
            selectedKeys={
              selectionMode === 'multiple'
                ? new Set(field.value ?? [])
                : field.value
                  ? new Set([field.value])
                  : new Set()
            }
            onSelectionChange={(keys: SharedSelection) => {
              if (keys === 'all') return;

              const values = Array.from(keys) as string[];

              if (selectionMode === 'multiple') {
                field.onChange(values);
                onSelect?.(values);
              } else {
                const value = values[0];
                field.onChange(value);
                onSelect?.(value);
              }
            }}
            placeholder={placeholder ?? 'Chọn'}
            {...(selectionMode === "multiple" && {
              renderValue: (items) => (
                <div className="flex flex-nowrap gap-2">
                  {items.map((item) => (
                    <Chip key={item.key}>{item.textValue}</Chip>
                  ))}
                </div>
              ),
            })}
            {...props}
          >
            {options.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>

          {fieldState.error && <FormErrorText errorMessage={fieldState.error.message} />}
        </ div>
      )}
    />
  );
}