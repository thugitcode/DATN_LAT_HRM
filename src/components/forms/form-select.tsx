import { useState } from 'react';
import {
  Box,
  Combobox,
  Flex,
  InputBase,
  Select,
  Text,
  useCombobox,
  type SelectProps,
} from '@mantine/core';

import type { FormFieldProps, FormSelectItem } from '@/types';
import { getFormFieldProps } from '@/lib/utils';

import { Icons } from '../icons';

export type FormSelectProps<T> = Omit<SelectProps, 'data' | 'onChange' | 'renderOption'> &
  FormFieldProps & {
    data?: FormSelectItem<T>[];
    onChange?: (value: string | null, option: FormSelectItem<T>) => void;
    renderOption?: (props: { option: FormSelectItem<T>; checked?: boolean }) => React.ReactNode;
    creatable?: boolean;
  };

export const FormSelect = <T,>({
  formProps,
  comboboxProps,
  creatable,
  ...props
}: FormSelectProps<T>) => {
  if (creatable) {
    return <CreatableSelect formProps={formProps} comboboxProps={comboboxProps} {...props} />;
  }

  return (
    <Select
      radius="md"
      placeholder={!props.readOnly ? 'Chọn' : ''}
      variant="filled"
      allowDeselect={false}
      nothingFoundMessage={
        <Flex direction="column" h={80} align="center" justify="center">
          <Box component={Icons.noData} mb="xs" w={30} />

          <Text ta="center" size="sm">
            Trống
          </Text>
        </Flex>
      }
      comboboxProps={{
        zIndex: 500,
        ...comboboxProps,
      }}
      {...(formProps
        ? {
            ...getFormFieldProps({ formProps }),
            ...{
              onChange: (value) => formProps.handleChange(value),
            },
          }
        : {})}
      {...props}
      styles={{
        label: {
          marginBottom: 8,
          fontSize: '14px',
          fontWeight: 500,
        },
        input: {
          height: 40,
          padding: '12px 14px',
          fontSize: '14px',
          borderRadius: 8,
          marginBottom: 10,
        },
        ...props.styles,
      }}
    />
  );
};

const CreatableSelect = <T,>({
  formProps,
  comboboxProps,
  data = [],
  onChange,
  label,
  error,
  required,
  disabled,
  readOnly,
  size = 'md',
  ...props
}: Omit<FormSelectProps<T>, 'creatable'>) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const formFieldProps = formProps ? getFormFieldProps({ formProps }) : {};
  const currentValue = formProps?.value ?? props.value;

  const [search, setSearch] = useState('');

  const currentOption = data.find((item) => item.value === currentValue);
  const displayValue = currentOption?.label ?? (currentValue as string) ?? '';

  const filteredOptions = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      {item.label}
    </Combobox.Option>
  ));

  const handleOptionSubmit = (val: string) => {
    const selectedOption = data.find((item) => item.value === val);
    if (formProps) {
      formProps.handleChange(val);
    }
    onChange?.(val, selectedOption as FormSelectItem<T>);
    setSearch('');
    combobox.closeDropdown();
  };

  const handleBlur = () => {
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      // Tự động sử dụng giá trị nhập nếu không match
      if (formProps) {
        formProps.handleChange(trimmedSearch);
      }
      onChange?.(trimmedSearch, {
        value: trimmedSearch,
        label: trimmedSearch,
      } as FormSelectItem<T>);
    }
    setSearch('');
    combobox.closeDropdown();
  };

  return (
    <Combobox
      store={combobox}
      withinPortal={true}
      onOptionSubmit={handleOptionSubmit}
      {...comboboxProps}
    >
      <Combobox.Target>
        <InputBase
          size={size}
          label={label}
          error={error ?? formFieldProps.error}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          radius="md"
          variant="filled"
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          value={search || displayValue}
          onChange={(event) => {
            const val = event.currentTarget.value;
            setSearch(val);

            if (val === '') {
              if (formProps) formProps.handleChange('');
              onChange?.('', null as any);
            }
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={handleBlur}
          placeholder={!readOnly ? 'Chọn hoặc nhập...' : ''}
          styles={{
            label: {
              marginBottom: 8,
              fontSize: '14px',
              fontWeight: 500,
            },
            input: {
              padding: '12px 14px',
              fontSize: '14px',
              borderRadius: 8,
              marginBottom: 10,
            },
            ...props.styles,
          }}
        />
      </Combobox.Target>

      <Combobox.Dropdown style={{ zIndex: 500 }}>
        <Combobox.Options>
          {options.length > 0 ? (
            options
          ) : (
            <Flex direction="column" h={80} align="center" justify="center">
              <Box component={Icons.noData} mb="xs" w={30} />
              <Text ta="center" size="sm">
                Trống
              </Text>
            </Flex>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
