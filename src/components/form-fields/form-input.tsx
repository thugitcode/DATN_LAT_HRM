import { Input } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import type { BaseFieldProps } from './types';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  type?: 'text' | 'time' | 'date';
  placeholder?: string;
};

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  isRequired,
  disabled,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          type={type}
          label={label}
          name={name}
          placeholder={placeholder}
          labelPlacement="outside"
          isRequired={isRequired}
          isDisabled={disabled}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          classNames={{
            label: 'text-xs font-normal leading-4 text-[#52525B]',
          }}
          step={60}
        />
      )}
    />
  );
}
