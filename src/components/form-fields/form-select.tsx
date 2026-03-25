import {
  Chip,
  Input,
  Select,
  SelectItem,
  Tooltip,
  type SelectItemProps,
  type SelectionMode,
  type SelectProps,
  type SharedSelection,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Controller, type FieldValues } from 'react-hook-form';

import { NAMESPACES } from '@/i18n/constants';
import { FormErrorText } from './form-error-text';
import { FormLabel } from './form-label';
import type { BaseFieldProps } from './types';
import { cn } from '@/lib/utils';

type Option = { key: string; label: string };

type SelectedItem = Parameters<NonNullable<SelectProps['renderValue']>>[0][number];

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
  const { t } = useTranslation(NAMESPACES.COMMON);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const isMultiple = selectionMode === 'multiple';

        const selectedLabels = isMultiple
          ? options.filter((opt) => (field.value ?? []).includes(opt.key as never)).map((opt) => opt.label)
          : options.find((opt) => opt.key === field.value)?.label ?? '';

        const selectedKeys = isMultiple
          ? new Set<string>(field.value ?? [])
          : field.value
            ? new Set<string>([field.value])
            : new Set<string>();

        const handleSelectionChange = (keys: SharedSelection) => {
          if (keys === 'all') return;
          const values = Array.from(keys) as string[];
          if (isMultiple) {
            field.onChange(values);
            onSelect?.(values);
          } else {
            const value = values[0];
            field.onChange(value);
            onSelect?.(value as string);
          }
        };

        return (
          <div className="flex flex-col gap-2">
            <FormLabel label={label} isRequired={isRequired} isError={!!fieldState.error} />

            {readOnly ? (
              isMultiple ? (
                <div className={cn("flex overflow-hidden gap-2 pb-1 px-2 pt-2", props?.variant === "underlined" ? "border-b border-gray-200 h-10" : "bg-default-100 rounded-xl h-10")}>
                  {selectedLabels.length ? <Tooltip className="max-w-xs" placement="top-start" content={(selectedLabels as string[]).join(', ')} showArrow>
                    <div className="flex flex-nowrap gap-2">
                      {(selectedLabels as string[]).map((lbl) => (
                        <Chip key={lbl}>{lbl}</Chip>
                      ))}
                    </div>
                  </Tooltip> : <span className="text-gray-500 text-[14px]"> {placeholder ?? t('select')}</span>}
                </div>
              ) : (
                <Input
                  variant={props?.variant}
                  value={selectedLabels as string}
                  isReadOnly
                  placeholder={placeholder ?? t('select')}
                  labelPlacement="outside-top"
                  classNames={{ inputWrapper: cn(props?.variant === "underlined" ? "" : "bg-[#F4F4F5]", "cursor-default") }}
                />
              )
            ) : (
              <Select
                selectionMode={selectionMode}
                isDisabled={disabled}
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
                placeholder={placeholder ?? t('select')}
                {...(isMultiple && {
                  renderValue: (items: SelectedItem[]) => (
                    <Tooltip
                      className="max-w-xs"
                      content={items.map((item) => item.textValue).join(', ')}
                      showArrow
                    >
                      <div className="flex flex-nowrap gap-2">
                        {items.map((item) => (
                          <Chip key={item.key as string}>{item.textValue}</Chip>
                        ))}
                      </div>
                    </Tooltip>
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