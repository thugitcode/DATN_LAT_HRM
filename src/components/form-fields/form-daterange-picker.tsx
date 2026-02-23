import { useState } from 'react';
import { DateRangePicker } from '@heroui/react';
import type { DateValue } from '@heroui/react';
import type { RangeValue } from '@react-types/shared';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import type { BaseFieldProps } from './types';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  onChange?: (value: { start: DateValue; end: DateValue }) => void;
};

export function FormDateRangePicker<T extends FieldValues>({
  control,
  name,
  label,
  isRequired,
  disabled,
  onChange,
}: Props<T>) {
  const [pickerValue, setPickerValue] = useState<RangeValue<DateValue> | null>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DateRangePicker
          label={label}
          labelPlacement="outside"
          isRequired={isRequired}
          isDisabled={disabled}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          className="max-w-xs"
          classNames={{
            label: 'text-xs font-normal leading-4 text-[#52525B]',
          }}
          granularity="day"
          value={pickerValue}
          onChange={(range) => {
            setPickerValue(range);
            if (range?.start && range?.end) {
              field.onChange(`${range.start}~${range.end}`);
              onChange?.(range);
            } else {
              field.onChange('');
            }
          }}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}
