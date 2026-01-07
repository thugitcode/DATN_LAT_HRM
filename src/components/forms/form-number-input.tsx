import { forwardRef } from 'react';
import { NumberInput, type NumberInputProps } from '@mantine/core';

import type { FormFieldProps } from '@/types';
import { getFormFieldProps } from '@/lib/utils';

export type FormNumberInputProps = NumberInputProps & FormFieldProps;

export const FormNumberInput = forwardRef<HTMLInputElement, FormNumberInputProps>(
  ({ formProps, ...props }, ref) => {
    return (
      <NumberInput
        ref={ref}
        radius="md"
        styles={{
          label: {
            marginBottom: 8,
            fontSize: "14px",
            fontWeight: 500,
          },
          input: {
            padding: "12px 14px",
            fontSize: "14px",
            borderRadius: 8,
            marginBottom: 10,
            height: 40,
          },
        }}
        placeholder={!props.readOnly ? 'Nhập' : ''}
        variant="filled"
        thousandSeparator=","
        {...(formProps
          ? {
              ...getFormFieldProps({ formProps }),
              ...{
                onChange: (value) => formProps.handleChange(value),
                onBlur: (e) => {
                  formProps.handleBlur(e);
                },
              },
            }
          : {})}
        {...props}
      />
    );
  },
);
FormNumberInput.displayName = 'FormNumberInput';
