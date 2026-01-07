import { DateInput, type DateInputProps } from '@mantine/dates';
import { useRef, type Ref } from 'react';

import dayjs from '@/lib/dayjs';
import { getFormFieldProps } from '@/lib/utils';
import type { FormFieldProps } from '@/types';

import { Icons } from '../icons';

type Props = DateInputProps & FormFieldProps;

export const FormDateInput = ({ formProps, ...props }: Props) => {
  const inputEl = useRef<HTMLButtonElement>(null);

  const getValue = () => {
    if (!formProps?.state?.value) return null;
    const value = formProps.state.value;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      if (!value || value.trim() === '') return null;
      
      let date = dayjs(value);
      if (date.isValid()) {
        return date.toDate();
      }
      
      date = dayjs(value, ['DD/MM/YYYY', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DDTHH:mm:ss.SSS[Z]', 'YYYY-MM-DDTHH:mm:ss[Z]'], true);
      if (date.isValid()) {
        return date.toDate();
      }
      
      date = dayjs.utc(value);
      if (date.isValid()) {
        return date.local().toDate();
      }
      
      return null;
    }
    return null;
  };

  return (
    <DateInput
      ref={inputEl as Ref<HTMLInputElement>}
      radius="md"
      placeholder={!props.readOnly ? 'DD/MM/YYYY' : ''}
      variant="filled"
      clearable={!props.withAsterisk}
      valueFormat="DD/MM/YYYY"
      dateParser={dateParser}
      styles={{
        label: {
          marginBottom: 8,
          fontSize: "14px",
          fontWeight: 500,
          minHeight: "22px",
          display: "block",
        },
        wrapper: {
          marginTop: 0,
        },
        input: {
          padding: "12px 14px",
          fontSize: "14px",
          borderRadius: 8,
          marginBottom: 10,
          height: 40,
        },
        ...props.styles,
      }}
      rightSection={
        <Icons.createAppointment
          style={{
            height: '60%',
            width: 'auto',
            display: 'block',
            cursor: 'pointer',
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            inputEl.current?.click();
          }}
        />
      }
      rightSectionWidth={40}
      {...(formProps
        ? {
            ...getFormFieldProps({ formProps }),
            value: getValue(),
            ...{
              onChange: (value) =>
                formProps.handleChange(value ? dayjs(value).toISOString() : null),
            },
          }
        : {})}
      {...props}
    />
  );
};

const dateParser: DateInputProps['dateParser'] = (input) => {
  if (!input) return new Date();

  const parsed = dayjs(input, 'DD/MM/YYYY', true);

  if (parsed.isValid()) {
    return parsed.toDate();
  }

  return dayjs(input).toDate();
};
