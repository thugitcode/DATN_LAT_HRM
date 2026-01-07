import { Box, Flex, MultiSelect, Text, type MultiSelectProps } from "@mantine/core";

import type { FormFieldProps, FormSelectItem } from "@/types";
import { getFormFieldProps } from "@/lib/utils";

import { Icons } from "../icons";

export type FormMultiSelectProps<T> = Omit<MultiSelectProps, "data"> &
  FormFieldProps & {
    data?: FormSelectItem<T>[];
  };

export const FormMultiSelect = <T,>({ formProps, ...props }: FormMultiSelectProps<T>) => {
  return (
    <MultiSelect
      radius="md"
      placeholder={!props.readOnly ? "Chọn" : ""}
      variant="filled"
      nothingFoundMessage={
        <Flex direction="column" h={80} align="center" justify="center">
          <Box component={Icons.noData} mb="xs" w={30} />

          <Text ta="center" size="sm">
            Trống
          </Text>
        </Flex>
      }
      {...(formProps
        ? {
            ...getFormFieldProps({ formProps }),
            ...{
              onChange: (value) => formProps.handleChange(value),
            },
          }
        : {})}
      {...props}
    />
  );
};
