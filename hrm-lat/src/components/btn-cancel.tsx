import { NAMESPACES } from "@/i18n/constants";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const BtnCancel = ({
  children,
  ...props
}: { children?: ReactNode } & ButtonProps) => {
  const { t } = useTranslation(NAMESPACES.COMMON)
  return (
    <Button
      color="primary"
      variant="bordered"
      {...props}
      className={cn("border-1", props.className)}
    >
      {children ?? t("button.cancel")}
    </Button>
  );
};