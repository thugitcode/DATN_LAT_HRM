import { useMemo, type CSSProperties } from "react";
import {
  ActionIcon,
  Box,
  Tooltip,
  type ActionIconProps,
  type BoxProps,
  type PolymorphicComponentProps,
  type TooltipProps,
} from "@mantine/core";

import { cn } from "@/lib/utils";
import { useCalcAnimationLoading } from "@/hooks/common/use-calc-animation-loading";

import { Icons, type IconProps } from "./icons";

type ButtonAction = "reload" | "export" | "import" | "share" | "delete";

export type ButtonIconTopbarActionProps = PolymorphicComponentProps<"div", ActionIconProps> & {
  label?: string;
  action: ButtonAction;
  iconProps?: BoxProps & IconProps;
  tooltipProps?: Omit<TooltipProps, "label">;
};

export const ButtonIconTopbarAction = ({
  label,
  action,
  iconProps,
  tooltipProps,
  loading,
  onClick,
  ...props
}: ButtonIconTopbarActionProps) => {
  const anim = useCalcAnimationLoading(loading);

  const { buttonIcon, tooltipDefaultLabel } = useMemo(() => {
    return getButtonContent(action);
  }, [action]);

  if (!buttonIcon) return null;

  return (
    <Tooltip label={label ?? tooltipDefaultLabel} {...tooltipProps}>
      <ActionIcon
        variant="light"
        size="lg"
        disabled={anim.shouldLoading}
        onClick={handleClick}
        {...props}
      >
        <Box
          component={buttonIcon}
          w="62.5%"
          {...iconProps}
          style={
            {
              ...iconProps?.style,
              ...anim.style,
            } as unknown as CSSProperties
          }
          className={cn(iconProps?.className, anim.className)}
        />
      </ActionIcon>
    </Tooltip>
  );

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    anim.onClick();
    onClick?.(event);
  }
};

function getButtonContent(action: ButtonAction) {
  let tooltipDefaultLabel: string | null = null;
  let buttonIcon: React.FC<IconProps> | null = null;

  switch (action) {
    case "reload":
      tooltipDefaultLabel = "Tải lại dữ liệu";
      buttonIcon = Icons.reload;
      break;

    case "delete":
      tooltipDefaultLabel = "Xóa dữ liệu";
      buttonIcon = Icons.trash;
      break;

    case "export":
      tooltipDefaultLabel = "Xuất dữ liệu";
      buttonIcon = Icons.cloudDownload;
      break;

    case "import":
      tooltipDefaultLabel = "Nhập dữ liệu";
      buttonIcon = Icons.cloudUpload;
      break;

    case "share":
      tooltipDefaultLabel = "Chia sẻ";
      buttonIcon = Icons.share;
      break;

    default:
      tooltipDefaultLabel = "Mặc định";
      buttonIcon = Icons.edit;
      break;
  }

  return {
    tooltipDefaultLabel,
    buttonIcon,
  };
}
