import { type FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import type { Status } from '@/types/global.type';
import { icons } from '@/lib/icons';

type StatusVariant = 'success' | 'danger' | 'warning' | 'default';

interface StatusConfig {
  color: StatusVariant;
  icon: keyof typeof icons;
  i18nKey: string;
}

const STATUS_CONFIG: Record<Status & { CONFIRMED: "CONFIRMED" }, StatusConfig> = {
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
  status: Status;
}

export const StatusChip: FC<StatusChipProps> = ({ status }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);

  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <Chip
      size="md"
      variant="flat"
      color={config.color}
      classNames={CHIP_CLASS_NAMES}
      startContent={icons[config.icon]}
    >
      {t(config.i18nKey)}
    </Chip>
  );
};
