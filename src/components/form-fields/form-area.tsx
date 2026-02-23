import { Textarea } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import type { BaseFieldProps } from './types';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
};

export function FormArea<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  isRequired,
  disabled,
  minRows = 3,
  maxRows = 8,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Textarea
          {...field}
          label={label}
          name={name}
          placeholder={placeholder}
          labelPlacement="outside"
          isRequired={isRequired}
          isDisabled={disabled}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          minRows={minRows}
          maxRows={maxRows}
          classNames={{
            label: 'text-xs font-normal leading-4 text-[#52525B]',
          }}
        />
      )}
    />
  );
}
