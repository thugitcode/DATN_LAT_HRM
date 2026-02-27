import type { FC } from 'react';
import { IconCircleCheckFilled } from '@tabler/icons-react';

import { icons } from '@/lib/icons';

import type { ExplanationSummary, ExplanationTypeCount } from '../types';

interface ExplanationSummaryCardProps {
  summary: ExplanationSummary;
  explanationTypes: ExplanationTypeCount[];
}

export const ExplanationSummaryCard: FC<Readonly<ExplanationSummaryCardProps>> = ({
  summary,
  explanationTypes,
}) => {
  return (
    <div className="flex items-stretch gap-6 bg-white rounded-xl p-5 flex-wrap">
      {/* Tổng quát */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-[#11181C] whitespace-nowrap">Tổng quát:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <SummaryBadge
            icon={icons.questionCircle}
            label="Tổng yêu cầu"
            count={summary.totalRequests}
            color="#006FEE"
            bgColor="#E6F1FE"
          />
          <div className="w-px h-8 bg-[#E4E4E7]" />
          <SummaryBadge
            icon={<icons.tickCircle />}
            label="Đã xác nhận"
            count={summary.approved}
            color="#17C964"
            bgColor="#E8FAF0"
          />
          <div className="w-px h-8 bg-[#E4E4E7]" />
          <SummaryBadge
            icon={<icons.closeSquare />}
            label="Từ chối"
            count={summary.rejected}
            color="#F31260"
            bgColor="#FEE7EF"
          />
          <div className="w-px h-8 bg-[#E4E4E7]" />
          <SummaryBadge
            icon={icons.refreshCircle}
            label="Chờ xác nhận"
            count={summary.pending}
            color="#F5A524"
            bgColor="#FEF4E6"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-[#E4E4E7] max-xl:hidden" />

      {/* Loại lỗi giải trình */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Title */}
        <div className="flex items-center gap-2.25">
          {icons.alarm}
          <span className="text-base font-medium text-[#11181C] whitespace-nowrap">
            Loại lỗi giải trình:
          </span>
        </div>

        {/* Items */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          {explanationTypes.map((type) => (
            <ExplanationTypeRow key={type.label} label={type.label} count={type.count} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface SummaryBadgeProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

const SummaryBadge: FC<Readonly<SummaryBadgeProps>> = ({ icon, label, count, color, bgColor }) => {
  return (
    <div
      className="flex flex-col items-start gap-1 rounded-lg px-4 py-2"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-base text-black font-medium whitespace-nowrap">{label}</span>
      </div>
      <span className="text-lg font-medium" style={{ color }}>
        {count}
      </span>
    </div>
  );
};

interface ExplanationTypeRowProps {
  label: string;
  count: number;
}

const ExplanationTypeRow: FC<Readonly<ExplanationTypeRowProps>> = ({ label, count }) => {
  // Calculate percentage - assuming max value around 50 for better visual representation
  const percentage = Math.min((count / 50) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-28 whitespace-nowrap">{label}</span>
      <div className="w-20 h-[8px] bg-[#E4E4E7] rounded-full relative">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: '#006FEE',
            width: `${percentage}%`,
          }}
        />
      </div>
      <span className="text-xs font-semibold text-[#11181C] min-w-[20px] text-right">{count}</span>
    </div>
  );
};
