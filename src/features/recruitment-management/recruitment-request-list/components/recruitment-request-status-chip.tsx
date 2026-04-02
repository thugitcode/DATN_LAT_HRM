import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { RecruitmentRequestStatusEnum } from '../type';

const STATUS_MAP: Record<
  RecruitmentRequestStatusEnum,
  { i18nKey: string; color: 'primary' | 'warning' | 'default' | 'secondary' }
> = {
  [RecruitmentRequestStatusEnum.RECRUITING]: {
    i18nKey: 'recruitment_request.status.recruiting',
    color: 'primary',
  },
  [RecruitmentRequestStatusEnum.PENDING]: {
    i18nKey: 'recruitment_request.status.pending',
    color: 'warning',
  },
  [RecruitmentRequestStatusEnum.CLOSED]: {
    i18nKey: 'recruitment_request.status.closed',
    color: 'default',
  },
  [RecruitmentRequestStatusEnum.INTERVIEWING]: {
    i18nKey: 'recruitment_request.status.interviewing',
    color: 'secondary',
  },
};

const CHIP_CLASS_NAMES = {
  base: 'h-8 px-3',
  content: 'text-sm font-medium',
} as const;

interface RecruitmentRequestStatusChipProps {
  status: RecruitmentRequestStatusEnum;
}

export const RecruitmentRequestStatusChip: FC<RecruitmentRequestStatusChipProps> = ({ status }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const config = STATUS_MAP[status];
  if (!config) return null;

  return (
    <Chip size="md" variant="flat" color={config.color} classNames={CHIP_CLASS_NAMES}>
      {t(config.i18nKey as any)}
    </Chip>
  );
};
