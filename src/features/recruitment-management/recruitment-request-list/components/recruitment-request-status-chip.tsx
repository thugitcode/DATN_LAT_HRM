import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { RecruitmentRequestStatusEnum } from '../types/type';

const STATUS_MAP: Record<
  RecruitmentRequestStatusEnum,
  { i18nKey: string; color: 'primary' | 'warning' | 'default' | 'secondary' | 'danger' | 'success' }
> = {
  [RecruitmentRequestStatusEnum.DRAFT]: {
    i18nKey: 'recruitment_request.status.draft',
    color: 'default',
  },
  [RecruitmentRequestStatusEnum.PENDING]: {
    i18nKey: 'recruitment_request.status.pending',
    color: 'warning',
  },
  [RecruitmentRequestStatusEnum.REJECTED]: {
    i18nKey: 'recruitment_request.status.rejected',
    color: 'danger',
  },
  [RecruitmentRequestStatusEnum.APPROVED]: {
    i18nKey: 'recruitment_request.status.approved',
    color: 'success',
  },
  [RecruitmentRequestStatusEnum.RECRUITING]: {
    i18nKey: 'recruitment_request.status.recruiting',
    color: 'primary',
  },
  [RecruitmentRequestStatusEnum.PAUSED]: {
    i18nKey: 'recruitment_request.status.paused',
    color: 'secondary',
  },
  [RecruitmentRequestStatusEnum.CANCELLED]: {
    i18nKey: 'recruitment_request.status.cancelled',
    color: 'warning',
  },
  [RecruitmentRequestStatusEnum.CLOSED]: {
    i18nKey: 'recruitment_request.status.closed',
    color: 'default',
  },
};

const CHIP_CLASS_NAMES = {
  base: 'h-6 px-2',
  content: 'text-xs font-normal',
} as const;

interface RecruitmentRequestStatusChipProps {
  status: RecruitmentRequestStatusEnum;
}

export const RecruitmentRequestStatusChip: FC<RecruitmentRequestStatusChipProps> = ({ status }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const config = STATUS_MAP[status];
  if (!config) return null;

  return (
    <Chip size="sm" variant="flat" color={config.color} classNames={CHIP_CLASS_NAMES}>
      {t(config.i18nKey as any)}
    </Chip>
  );
};
