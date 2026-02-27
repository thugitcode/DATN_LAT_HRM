import { FormErrorText } from '@/components/form-fields/form-error-text';
import type { BaseFieldProps } from '@/components/form-fields/types';
import TimePicker from '@/components/time-picker';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  disabled?: boolean;
  showSeconds?: boolean;
  onTrigger?: () => void;
  classInput?: string;
  showIcon?: boolean
};

export function FormTimePicker<T extends FieldValues>({
  control,
  name,
  label,
  isRequired,
  disabled,
  showSeconds = false,
  onTrigger,
  classInput,
  showIcon
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;

        return (
          <div className="flex flex-col gap-1 justify-between">

            <TimePicker
              value={field.value ?? ''}
              onChange={(val) => {
                field.onChange(val);
                onTrigger?.();
              }}
              showSeconds={showSeconds}
              disabled={disabled}
              classInput={classInput}
              showIcon={showIcon}
              //   isInvalid={hasError}
            />

            {fieldState.error && <FormErrorText errorMessage={fieldState.error.message} />}
          </div>
        );
      }}
    />
  );
}
