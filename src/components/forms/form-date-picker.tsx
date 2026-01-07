import { Box } from "@mantine/core";
import { DatePickerInput, type DatePickerInputProps } from "@mantine/dates";

import type { FormFieldProps } from "@/types";
import dayjs from "@/lib/dayjs";
import { getFormFieldProps } from "@/lib/utils";

import { Icons } from "../icons";

type Props = DatePickerInputProps & FormFieldProps;

export const FormDatePicker = ({ formProps, ...props }: Props) => {
  return (
    <DatePickerInput
      radius="md"
      placeholder={!props.readOnly ? "DD/MM/YYYY" : ""}
      variant="filled"
      clearable={!props.withAsterisk}
      valueFormat="DD/MM/YYYY"
      leftSection={<Box component={Icons.calendar} w={18} mt={-2} />}
      {...(formProps
        ? {
            ...getFormFieldProps({ formProps }),
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
