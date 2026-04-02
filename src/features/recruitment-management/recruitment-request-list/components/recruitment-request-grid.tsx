import type { FC } from 'react';
import { Spinner } from '@heroui/react';

import type { RecruitmentRequest } from '../type';
import { RecruitmentRequestCard } from './recruitment-request-card';

interface RecruitmentRequestGridProps {
  data: RecruitmentRequest[];
  isLoading?: boolean;
}

export const RecruitmentRequestGrid: FC<RecruitmentRequestGridProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-420px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-420px)] text-[#71717A] text-sm">
        Không có dữ liệu
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
