import {
  Flex,
  Radio,
  RadioGroup,
  type MantineSpacing,
  type RadioGroupProps,
  type RadioProps,
  type StyleProp,
} from "@mantine/core";

import type { FormFieldProps } from "@/types";
import { getFormFieldProps } from "@/lib/utils";

export type FormRadioProps = Omit<RadioGroupProps, "children"> &
  FormFieldProps & {
    data: {
      label: string;
      value: Required<RadioProps>["value"] | boolean;
    }[];
    vertical?: boolean;
    gap?: StyleProp<MantineSpacing>;
  };

export const FormRadio = ({ formProps, data, vertical = false, gap, ...props }: FormRadioProps) => {
  return (
    <RadioGroup
      {...(formProps
        ? {
          ...getFormFieldProps({ formProps }),
          ...{
            onChange: (value) => {
              formProps.handleChange(formatValue(value));
            },
            value:
              typeof getFormFieldProps({ formProps }).value === "boolean"
                ? String(getFormFieldProps({ formProps }).value)
                : getFormFieldProps({ formProps }).value,
          },
        }
        : {})}
      {...props}
    >
      <Flex direction={vertical ? "column" : "row"} gap={gap || (vertical ? "xs" : "xl")}>
        {data.map((item) => (
          <Radio
            key={item.value.toString()}
            value={typeof item.value === "boolean" ? String(item.value) : item.value}
            label={item.label}
          />
        ))}
      </Flex>
    </RadioGroup>
  );
};

const formatValue = (value: string) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};
