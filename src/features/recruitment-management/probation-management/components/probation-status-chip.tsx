import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { PROBATION_STATUS_CONFIG } from '../constants/constants';
import type { ProbationStatusEnum } from '../types/probation.type';

interface ProbationStatusChipProps {
  status: ProbationStatusEnum;
}

export const ProbationStatusChip: FC<ProbationStatusChipProps> = ({ status }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const config = PROBATION_STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}
    >
      {t(config.labelKey as any)}
    </span>
  );
};
