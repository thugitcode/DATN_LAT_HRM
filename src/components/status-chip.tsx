import { type FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import type { Status } from '@/types/global.type';
import { icons } from '@/lib/icons';

type StatusVariant = 'success' | 'danger' | 'warning' | 'default';

export interface StatusConfig {
  color: StatusVariant;
  icon: keyof typeof icons;
  i18nKey: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  APPROVED: {
    color: 'success',
    icon: 'checkedDone',
    i18nKey: 'status.approved',
  },
  REJECTED: {
    color: 'danger',
    icon: 'cancel',
    i18nKey: 'status.rejected',
  },
  PENDING: {
    color: 'warning',
    icon: 'peinding',
    i18nKey: 'status.pending',
  },
  ACTIVE: {
    color: 'success',
    icon: 'tickCircleV2',
    i18nKey: 'status.active',
  },
  INACTIVE: {
    color: 'default',
    icon: 'closeSquare',
    i18nKey: 'status.inactive',
  },
  WORKING: {
    color: 'success',
    icon: 'tickCircleV2',
    i18nKey: 'status.working',
  },
  RESIGNED: {
    color: 'danger',
    icon: 'closeSquare',
    i18nKey: 'status.resigned',
  },
  CANCELLED: {
    color: 'default',
    icon: 'closeSquare',
    i18nKey: 'status.cancelled',
  },
  CONFIRMED: {
    color: 'success',
    icon: 'tickCircleV2',
    i18nKey: 'status.confirmed',
  },
} as const;

const CHIP_CLASS_NAMES = {
  base: 'h-8 w-[116px] px-2',
  content: 'text-sm font-medium flex-1 text-center',
} as const;

interface StatusChipProps {
  status: Status | string | undefined | null;
  statusConfig?: Record<string, StatusConfig>;
}

export const StatusChip: FC<StatusChipProps> = ({ status, statusConfig }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);

  if (!status) return null;

  const config = statusConfig ? statusConfig[status as string] : STATUS_CONFIG[status as string];

  if (!config) return null;

  const icon = icons[config.icon];

  return (
    <Chip
      size="md"
      variant="flat"
      color={config.color}
      classNames={CHIP_CLASS_NAMES}
      startContent={typeof icon === 'function' ? icon({ width: 16, height: 16 }) : icon}
    >
      {t(config.i18nKey as any)}
    </Chip>
  );
};
