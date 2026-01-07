import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from '@mantine/core';

import type { FormFieldProps } from '@/types';
import { getFormFieldProps } from '@/lib/utils';

export type FormInputProps = TextInputProps & FormFieldProps;

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ formProps, ...props }, ref) => {
    return (
      <TextInput
        styles={{
          label: {
            marginBottom: 8,
            fontSize: '14px',
            fontWeight: 500,
            fontStyle: 'normal',
          },
          input: {
            padding: '12px 14px',
            fontSize: '14px',
            borderRadius: 8,
            marginBottom: 10,
          },
        }}
        ref={ref}
        radius="md"
        placeholder={!props.readOnly ? 'Nhập' : ''}
        variant="filled"
        {...(formProps
          ? {
              ...getFormFieldProps({ formProps }),
              ...{
                onChange: (e) => formProps.handleChange(e.target.value),
              },
            }
          : {})}
        {...props}
      />
    );
  },
);
FormInput.displayName = 'FormInput';
