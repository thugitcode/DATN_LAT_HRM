import { Button, type ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";

export const BtnCancel = ({
  children,
  ...props
}: { children?: ReactNode } & ButtonProps) => {
  return (
    <Button
      color="primary"
      variant="bordered"
      {...props}
    >
      {children ?? "Hủy"}
    </Button>
  );
};