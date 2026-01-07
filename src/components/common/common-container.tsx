import { Stack, type StackProps } from "@mantine/core";

export type CommonContainerProps = StackProps & {
  overflowHidden?: boolean;
};

export const CommonContainer = ({
  children,
  overflowHidden = false,
  style,
  ...props
}: CommonContainerProps) => {
  return (
    <Stack
      gap="sm"
      h="100%"
      p="lg"
      style={{
        ...(overflowHidden ? { overflow: "hidden" } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
};
