import { useMemo, useRef, type Ref } from 'react';
import { TimePicker, type TimePickerProps } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';

import type { FormFieldProps } from '@/types';
import { getFormFieldProps } from '@/lib/utils';

type Props = TimePickerProps &
  FormFieldProps & {
    selectedDate?: Date | null;
  };

export const FormTimeSelectFuture = ({ formProps, selectedDate, ...props }: Props) => {
  const inputEl = useRef<HTMLInputElement>(null);

  const min = useMemo(() => {
    if (!selectedDate) return undefined;

    const today = dayjs().startOf('day');
    const selected = dayjs(selectedDate).startOf('day');

    if (selected.isSame(today, 'day')) {
      const now = dayjs();
      return now.second(0).format('HH:mm');
    }

    return undefined;
  }, [selectedDate]);

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
            inputEl.current?.focus();
          }}
        />
      }
      withDropdown
      popoverProps={{
        zIndex: 500,
      }}
      rightSectionWidth={40}
      min={min}
      {...(formProps
        ? {
            ...getFormFieldProps({ formProps }),
            onChange: (val: string) => {
              formProps.handleChange(val);
            },
          }
        : {})}
      {...props}
    />
  );
};
