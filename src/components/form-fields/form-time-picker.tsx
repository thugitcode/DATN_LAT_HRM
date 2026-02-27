import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import TimePicker from '../time-picker';
import { FormErrorText } from './form-error-text';
import { FormLabel } from './form-label';
import type { BaseFieldProps } from './types';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  disabled?: boolean;
  showSeconds?: boolean;
  onTrigger?: () => void;
};

export function FormTimePicker<T extends FieldValues>({
  control,
  name,
  label,
  isRequired,
  disabled,
  showSeconds = false,
  onTrigger,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;

        return (
          <div className="flex flex-col gap-1 justify-between">
            <FormLabel label={label} isRequired={isRequired} isError={!!fieldState.error} />

            <TimePicker
              value={field.value ?? ''}
              onChange={(val) => {
                field.onChange(val);
                onTrigger?.();
              }}
              showSeconds={showSeconds}
              disabled={disabled}
              //   isInvalid={hasError}
            />

            {fieldState.error && <FormErrorText errorMessage={fieldState.error.message} />}
          </div>
        );
      }}
    />
  );
}
