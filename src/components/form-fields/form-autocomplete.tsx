import { Autocomplete, AutocompleteItem, Input } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import { FormErrorText } from './form-error-text';
import { FormLabel } from './form-label';
import type { BaseFieldProps } from './types';

type Option = { key: string; label: string };

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  options: Option[];
  placeholder?: string;
  readOnly?: boolean;
  onSelect?: (key: string) => void;
  variant?: 'flat' | 'underlined' | 'bordered';
};

export function FormAutocomplete<T extends FieldValues>({
  control,
  name,
  label,
  options,
  isRequired,
  disabled,
  placeholder,
  readOnly,
  onSelect,
  variant
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedLabel = options.find((opt) => opt.key === field.value)?.label ?? '';

        return (
          <div className="flex flex-col gap-2">
            <FormLabel label={label} isRequired={isRequired} isError={!!fieldState.error} />

            {readOnly ? (
              <Input
                value={selectedLabel}
                readOnly
                labelPlacement="outside-top"
                classNames={{
                  inputWrapper: 'cursor-default',
                }}
                variant={variant}
              />
            ) : (
              <Autocomplete
                variant={variant}
                selectedKey={field.value}
                isDisabled={disabled}
                placeholder={placeholder ?? 'Chọn'}
                onSelectionChange={(key) => {
                  const value = key ?? '';
                  field.onChange(value);
                  if (value) onSelect?.(String(value));
                }}
              >
                {options.map((opt) => (
                  <AutocompleteItem key={opt.key}>{opt.label}</AutocompleteItem>
                ))}
              </Autocomplete>
            )}

            {fieldState.error && <FormErrorText errorMessage={fieldState.error.message} />}
          </div>
        );
      }}
    />
  );
}
