import { Textarea, type TextareaProps } from "@mantine/core";

import type { FormFieldProps } from "@/types";
import { getFormFieldProps } from "@/lib/utils";

export type FormTextareaProps = TextareaProps & FormFieldProps;

export const FormTextarea = ({ formProps, ...props }: FormTextareaProps) => {
  return (
    <Textarea
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
        },
      }}
      placeholder={!props.readOnly ? "Nhập" : ""}
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
};
