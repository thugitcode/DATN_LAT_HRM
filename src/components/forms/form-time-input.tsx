import { useRef, type Ref } from 'react';
import { TimePicker, type TimePickerProps } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';

import type { FormFieldProps } from '@/types';
import { getFormFieldProps } from '@/lib/utils';

type Props = TimePickerProps & FormFieldProps;

export const FormTimeInput = ({ formProps, ...props }: Props) => {
  const inputEl = useRef<HTMLInputElement>(null);

  return (
    <TimePicker
      ref={inputEl as Ref<HTMLInputElement>}
      radius="md"
      variant="filled"
      rightSection={
        <IconClock
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
      withDropdown
      popoverProps={{
        zIndex: 700,
      }}
      rightSectionWidth={40}
      {...(formProps
        ? {
            ...getFormFieldProps({ formProps }),
            ...{
              onChange: (val) => {
                formProps.handleChange(val);
              },
            },
          }
        : {})}
      {...props}
    />
  );
};
