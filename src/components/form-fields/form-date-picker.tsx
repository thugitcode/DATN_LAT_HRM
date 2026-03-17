import { DatePicker } from '@heroui/react';
import type { DatePickerProps, DateValue } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import type { BaseFieldProps } from './types';
import { cn } from '@/lib/utils';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  disabled?: boolean;
  onTrigger?: () => void;
} & Partial<DatePickerProps>;

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  isRequired,
  disabled,
  onTrigger,
  ...props
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          showMonthAndYearPickers
          label={label}
          labelPlacement="outside"
          isRequired={isRequired}
          isDisabled={disabled}
          locale="vi-VN"
          value={field.value ? (parseDate(field.value) as DateValue) : null}
          onChange={(date: DateValue | null) => {
            field.onChange(date ? date.toString() : '');
            onTrigger?.();
          }}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          onBlur={field.onBlur}
          classNames={{
            inputWrapper: `
              data-[invalid=true]:!bg-[#F4F4F5]
              group-data-[invalid=true]:!bg-[#F4F4F5]
            `,
            label: cn('text-base font-normal leading-4 text-[#52525B]',
              !!fieldState.error ? 'text-[#F31260]' : 'text-[#52525B]'),
          }}
          {...props}
        />
      )}
    />
  );
}
