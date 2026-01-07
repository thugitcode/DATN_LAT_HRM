import { Box, type BoxComponentProps, type PolymorphicComponentProps } from "@mantine/core";

export type FormContainerProps = PolymorphicComponentProps<"div", BoxComponentProps>;

export const FormContainer = ({ ...props }: FormContainerProps) => {
  return <Box px="lg" py="md" bdrs="md" bg="background" {...props} />;
};
