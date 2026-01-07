import { Flex, Switch, Text, type SwitchProps } from "@mantine/core";

import type { FormFieldProps } from "@/types";
import { getFormFieldProps } from "@/lib/utils";

export type FormSwitchProps = SwitchProps & FormFieldProps;

export const FormSwitch = ({
  formProps,
  labelPosition = "left",
  label,
  withThumbIndicator = false,
  ...props
}: FormSwitchProps) => {
  if (labelPosition === "left") {
    return (
      <Flex gap="xs" justify="space-between" align="center">
        <Text size="sm">{label}</Text>

        <Switch
          withThumbIndicator={withThumbIndicator}
          {...(formProps
            ? {
                ...getFormFieldProps({ formProps }),
                onChange: (e) => formProps.handleChange(e.target.checked),
              }
            : props)}
          {...props}
        />
      </Flex>
    );
  }

  return (
    <Switch
      label={label}
      withThumbIndicator={withThumbIndicator}
      {...(formProps ? { ...getFormFieldProps({ formProps }) } : props)}
      {...props}
    />
  );
};
