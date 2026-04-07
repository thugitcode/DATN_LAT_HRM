import type { FC } from 'react';
import { Spinner } from '@heroui/react';

import type { RecruitmentRequest } from '../types/type';
import { RecruitmentRequestCard } from './recruitment-request-card';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

interface RecruitmentRequestGridProps {
  data: RecruitmentRequest[];
  isLoading?: boolean;
}

export const RecruitmentRequestGrid: FC<RecruitmentRequestGridProps> = ({ data, isLoading }) => {
  const { t } = useTranslation(NAMESPACES.COMMON)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-396px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-396px)] text-[#71717A] text-sm">
        {t("table.empty")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {data.map((item) => (
        <RecruitmentRequestCard key={item.id} data={item} />
      ))}
    </div>
  );
};
