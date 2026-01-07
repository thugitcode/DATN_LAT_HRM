import {
  Box,
  Combobox,
  Flex,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { useEffect, useState } from 'react';

import type { FormFieldProps, FormSelectItem } from '@/types';
import { getFormFieldProps } from '@/lib/utils';
import { Icons } from '../icons';

export type FormContactComboboxProps<T> = FormFieldProps & {
  data?: FormSelectItem<T>[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles?: any;
  onChange?: (value: string | null, option?: FormSelectItem<T>) => void;
};

export const FormContactCombobox = <T,>({
  formProps,
  data = [],
  label,
  placeholder = 'Chọn',
  required,
  readOnly,
  styles,
  onChange,
}: FormContactComboboxProps<T>) => {
  const combobox = useCombobox();
  const field = formProps ? getFormFieldProps({ formProps }) : undefined;

  const [value, setValue] = useState<string>(field?.value ?? '');

  useEffect(() => {
    if (field?.value !== value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(field?.value ?? '');
    }
  }, [field?.value]);

  const filtered = data.filter((item) =>
    item.label.toLowerCase().includes(value.toLowerCase())
  );

  const handleChange = (val: string) => {
    setValue(val);
    formProps?.handleChange(val);
    const option = data.find((o) => o.value === val);
    onChange?.(val, option);
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        handleChange(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          label={label}
          required={required}
          placeholder={placeholder}
          readOnly={readOnly}
          value={value}
          error={field?.error}
          onChange={(e) => {
            handleChange(e.currentTarget.value);
            combobox.openDropdown();
          }}
          onFocus={() => combobox.openDropdown()}
          styles={{
            label: {
              marginBottom: 8,
              fontSize: '14px',
              fontWeight: 500,
            },
            input: {
              height: 42,
              padding: '12px 14px',
              fontSize: '14px',
              borderRadius: 8,
              marginBottom: 10,
            },
            ...styles,
          }}
        />
      </Combobox.Target>

      {!readOnly && (
        <Combobox.Dropdown>
          <Combobox.Options>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <Combobox.Option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </Combobox.Option>
              ))
            ) : (
              <Flex
                direction="column"
                h={80}
                align="center"
                justify="center"
              >
                <Box component={Icons.noData} mb="xs" w={30} />
                <Text size="sm">Nhập người liên hệ mới</Text>
              </Flex>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
};
