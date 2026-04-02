import type { FC } from 'react';
import { Chip } from '@heroui/react';

import { RecruitmentRequestStatusEnum } from '../type';

const STATUS_MAP: Record<
  RecruitmentRequestStatusEnum,
  { label: string; color: 'primary' | 'warning' | 'default' | 'secondary' }
> = {
  [RecruitmentRequestStatusEnum.RECRUITING]: {
    label: 'Đang tuyển',
    color: 'primary',
  },
  [RecruitmentRequestStatusEnum.PENDING]: {
    label: 'Chờ duyệt',
    color: 'warning',
  },
  [RecruitmentRequestStatusEnum.CLOSED]: {
    label: 'Đã đóng',
    color: 'default',
  },
  [RecruitmentRequestStatusEnum.INTERVIEWING]: {
    label: 'Chờ phỏng vấn',
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
  const config = STATUS_MAP[status];
  if (!config) return null;

  return (
    <Chip size="md" variant="flat" color={config.color} classNames={CHIP_CLASS_NAMES}>
      {config.label}
    </Chip>
  );
};
