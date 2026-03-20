import { Input, type InputProps, type InternalForwardRefRenderFunction } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import type { BaseFieldProps } from './types';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  type?: 'text' | 'time' | 'date';
  placeholder?: string;
  endContent?: ReactNode
} & Partial<InputProps>;

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  isRequired,
  disabled,
  endContent,
  ...props
}: Props<T>) {
  const { t } = useTranslation(NAMESPACES.COMMON);
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
          placeholder={placeholder || t("input.placeholder")}
          labelPlacement="outside-top"
          isRequired={isRequired}
          isDisabled={disabled}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          classNames={{
            label: cn('text-base font-normal leading-4 text-[#52525B]',
              !!fieldState.error ? 'text-[#F31260]' : 'text-[#52525B]'),
            inputWrapper: `
  data-[invalid=true]:!bg-[#F4F4F5]
  group-data-[invalid=true]:!bg-[#F4F4F5]
`,
            input: '[&::-webkit-datetime-edit-ampm-field]:hidden',
          }}
          lang="en-GB"
          step={60}
          endContent={endContent}
          {...props}
        />
      )}
    />
  );
}
