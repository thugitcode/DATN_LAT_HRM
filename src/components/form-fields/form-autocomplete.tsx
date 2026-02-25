import { Autocomplete, AutocompleteItem } from '@heroui/react';
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

export function FormAutocomplete<T extends FieldValues>({
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

          <Autocomplete
            selectedKey={field.value}
            isDisabled={disabled}
            placeholder={placeholder ?? 'Chọn'}
            onSelectionChange={(key) => {
              field.onChange(key);
              onSelect?.(String(key));
            }}
          >
            {options.map((opt) => (
              <AutocompleteItem key={opt.key}>{opt.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          {fieldState.error && <FormErrorText errorMessage={fieldState.error.message} />}
        </div>
      )}
    />
  );
}
