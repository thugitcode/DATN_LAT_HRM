import {
  Box,
  Checkbox,
  SimpleGrid,
  type CheckboxGroupProps,
  type ComboboxItem,
} from '@mantine/core';

import type { FormFieldProps } from '@/types';
import { getFormFieldProps, randomUUID } from '@/lib/utils';

export type RenderCheckboxProps = {
  Component: () => React.JSX.Element;
  item: ComboboxItem;
};

export type FormCheckboxProps = Omit<CheckboxGroupProps, 'children'> &
  FormFieldProps & {
    data: ComboboxItem[];
    columns?: number;
    hasCheckAll?: boolean;
    labelCheckAll?: string;
    checkboxLabelStyles?: React.CSSProperties;
    filteredData?: ComboboxItem[];
    renderCheckbox?: (props: RenderCheckboxProps) => React.JSX.Element;
  };

export const FormCheckbox = ({
  formProps,
  labelCheckAll = 'Tất cả',
  data,
  columns = 1,
  hasCheckAll = true,
  checkboxLabelStyles,
  filteredData,
  renderCheckbox,
  ...props
}: FormCheckboxProps) => {
  const allChecked = data.every((item) => formProps?.state?.value?.includes(item.value));
  const indeterminate =
    data.some((item) => formProps?.state?.value?.includes(item.value)) && !allChecked;

  return (
    <>
      {hasCheckAll && (
        <Checkbox
          key={randomUUID()}
          checked={allChecked}
          indeterminate={indeterminate}
          label={labelCheckAll}
          styles={{ label: { fontWeight: 500 } }}
          onChange={() => {
            if (!allChecked) {
              const value = data.map((item) => item.value);
              formProps?.handleChange?.(value);
            } else {
              formProps?.handleChange?.([]);
            }
          }}
        />
      )}

      <Checkbox.Group
        {...(formProps
          ? {
              ...getFormFieldProps({ formProps }),
              ...{
                onChange: (value) => formProps.handleChange(value),
              },
            }
          : {})}
        {...props}
      >
        <SimpleGrid cols={columns}>
          {(filteredData || data).map((item) => {
            const Component = () => (
              <Checkbox
                label={item.label}
                value={item.value}
                disabled={item.disabled}
                styles={{ label: { fontWeight: 500, ...checkboxLabelStyles } }}
              />
            );

            return (
              <Box key={item.value}>
                {renderCheckbox ? renderCheckbox({ Component, item }) : <Component />}
              </Box>
            );
          })}
        </SimpleGrid>
      </Checkbox.Group>
    </>
  );
};
