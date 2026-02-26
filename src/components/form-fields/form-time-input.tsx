import { TimeInput, type SlotsToClasses, type TimeInputValue } from '@heroui/react';
import { parseTime } from '@internationalized/date';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import type { BaseFieldProps } from './types';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  disabled?: boolean;
  onTrigger?: () => void;
  // Optional: giới hạn giờ (nếu cần)
  minValue?: TimeInputValue;
  maxValue?: TimeInputValue;
  hourCycle?: 12 | 24; // mặc định 24h cho Việt Nam
  classNames?: SlotsToClasses<"base" | "input" | "label" | "description" | "errorMessage" | "inputWrapper" | "innerWrapper" | "segment" | "helperWrapper"> | undefined
};

export function FormTimeInput<T extends FieldValues>({
  control,
  name,
  label,
  isRequired,
  disabled,
  onTrigger,
  minValue,
  maxValue,
  hourCycle = 24,
  classNames
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Chuyển string ISO time (ví dụ: "14:30:00") thành TimeValue
        let parsedValue: TimeInputValue | null = null;
        if (field.value && typeof field.value === 'string') {
          try {
            parsedValue = parseTime(field.value);
          } catch (e) {
            console.warn(`Invalid time format for field ${name}:`, field.value);
          }
        }

        return (
          <TimeInput
            label={label}
            labelPlacement="outside"
            isRequired={isRequired}
            isDisabled={disabled}
            hourCycle={hourCycle} // 24h phổ biến ở VN
            value={parsedValue}
            onChange={(time: TimeInputValue | null) => {
              // Chuyển về string ISO (ví dụ: "14:30:00") hoặc rỗng
              const value = time ? time.toString() : '';
              field.onChange(value);
              onTrigger?.();
            }}
            minValue={minValue}
            maxValue={maxValue}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            onBlur={field.onBlur}
            classNames={{
              inputWrapper: `
                data-[invalid=true]:!bg-[#F4F4F5]
                group-data-[invalid=true]:!bg-[#F4F4F5]
              `,
              ...classNames
            }}
          />
        );
      }}
    />
  );
}