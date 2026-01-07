import { Box, Button, type ButtonProps, type PolymorphicComponentProps } from "@mantine/core";

import { Icons } from "./icons";

type Props = PolymorphicComponentProps<"div", ButtonProps>;

export const ButtonCreate = ({ children, ...props }: Props) => {
  return (
    <Button variant="filled" leftSection={<Box component={Icons.plus} w={20} />} {...props}>
      {children ?? "Thêm mới"}
    </Button>
  );
};
