import { NAMESPACES } from "@/i18n/constants";
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
    >
      {children ?? t("button.cancel")}
    </Button>
  );
};