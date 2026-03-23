import { Chip, Input, Select, SelectItem, type SelectionMode, type SelectProps, type SharedSelection } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import { FormErrorText } from './form-error-text';
import { FormLabel } from './form-label';
import type { BaseFieldProps } from './types';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

type Option = { key: string; label: string };

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  options: Option[];
  placeholder?: string;
  onSelect?: (key: string | string[]) => void;
  selectionMode?: SelectionMode;
  readOnly?: boolean;
} & Partial<SelectProps<T>>;

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  isRequired,
  disabled,
  placeholder,
  onSelect,
  selectionMode = 'single',
  readOnly,
  ...props
}: Props<T>) {
  const { t } = useTranslation(NAMESPACES.COMMON)

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
                isReadOnly
                labelPlacement="outside-top"
                classNames={{
                  inputWrapper: 'bg-[#F4F4F5] cursor-default',
                }}
              />
            ) : (
              <Select
                selectionMode={selectionMode}
                isDisabled={disabled}
                selectedKeys={
                  selectionMode === 'multiple'
                    ? new Set(field.value ?? [])
                    : field.value
                      ? new Set([field.value])
                      : new Set()
                }
                onSelectionChange={(keys: SharedSelection) => {
                  if (keys === 'all') return;

                  const values = Array.from(keys) as string[];

                  if (selectionMode === 'multiple') {
                    field.onChange(values);
                    onSelect?.(values);
                  } else {
                    const value = values[0];
                    field.onChange(value);
                    onSelect?.(value);
                  }
                }}
                placeholder={placeholder ?? t("select")}
                {...(selectionMode === "multiple" && {
                  renderValue: (items: any) => (
                    <div className="flex flex-nowrap gap-2">
                      {items.map((item: any) => (
                        <Chip key={item.key}>{item.textValue}</Chip>
                      ))}
                    </div>
                  ),
                })}
                {...props}
              >
                {options.map((opt) => (
                  <SelectItem key={opt.key}>{opt.label}</SelectItem>
                ))}
              </Select>
            )}
            {fieldState.error && <FormErrorText errorMessage={fieldState.error.message} />}
          </div>
        );
      }}
    />
  );
}