import {
  ActionIcon,
  Box,
  Tooltip,
  type ActionIconProps,
  type BoxProps,
  type PolymorphicComponentProps,
  type SwitchProps,
  type TooltipProps,
} from '@mantine/core';

import { CommonSwitchLock } from './common/common-switch-lock';
import { Icons, type IconProps, type MainSiderIconProps } from './icons';

export type ButtonIconTableActionProps = PolymorphicComponentProps<'div', ActionIconProps> & {
  label?: string;
  action: 'edit' | 'delete' | 'call' | 'info' | 'setting' | 'download' | 'message' | 'active';
  iconProps?: BoxProps & IconProps & MainSiderIconProps;
  tooltipProps?: Omit<TooltipProps, 'label'>;
  swicthProps?: SwitchProps;
};

export const ButtonIconTableAction = ({
  label,
  action,
  iconProps,
  tooltipProps,
  ...props
}: ButtonIconTableActionProps) => {
  let tooltipDefaultLabel: string | null = null;
  let buttonIcon: React.FC<IconProps> | null = null;

  switch (action) {
    case 'edit':
      tooltipDefaultLabel = 'Sửa bản ghi';
      buttonIcon = Icons.edit;
      break;

    case 'delete':
      tooltipDefaultLabel = 'Xóa bản ghi';
      buttonIcon = Icons.trash;
      break;

    case 'info':
      tooltipDefaultLabel = 'Xem chi tiết';
      buttonIcon = Icons.infoCircle;
      break;

    case 'download':
      tooltipDefaultLabel = 'Xem chi tiết';
      buttonIcon = Icons.download;
      break;
    case 'message':
      tooltipDefaultLabel = 'Xem chi tiết';
      buttonIcon = Icons.message;
      break;

    case 'setting':
      tooltipDefaultLabel = 'Cấu hình';
      buttonIcon = Icons.setting;
      iconProps = {
        ...iconProps,
        strokeprimary: '#4F5675',
        strokesecondary: '#4F5675',
      };
      break;

    default:
      tooltipDefaultLabel = 'Mặc định';
      buttonIcon = Icons.edit;
      break;
  }

  if (!buttonIcon) return null;

  return (
    <Tooltip label={label ?? tooltipDefaultLabel} {...tooltipProps}>
      {action === 'active' ? (
        <CommonSwitchLock
          onChange={async (e) => {
            e.preventDefault()
            await props?.onChange?.(e.target.checked as any);
          }}
          defaultChecked={!!props?.defaultChecked}
          checkedLabel="Kích hoạt lại"
          uncheckedLabel="Tạm dừng"
        />
      ) : (
        <ActionIcon variant="subtle" {...props}>
          <Box component={buttonIcon} w={15} {...iconProps} />
        </ActionIcon>
      )}
    </Tooltip>
  );
};
