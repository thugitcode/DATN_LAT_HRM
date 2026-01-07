import type { ComponentProps } from "react";
import { Box, type BoxProps } from "@mantine/core";

export type FormProps = ComponentProps<"form"> &
  BoxProps & {
    onSubmit?: () => void;
  };

export const Form = ({ onSubmit, ...props }: FormProps) => {
  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit?.();
      }}
      h="100%"
      {...props}
    />
  );
};
