// components/AttendanceSummary.tsx
import React from 'react';

interface StatItemProps {
  label: string;
  value: number | string;
  change: string; // ví dụ: "+12" hoặc "-2"
  changeColor?: 'green' | 'red' | 'neutral'; // để tùy chỉnh màu
}

const StatItem: React.FC<StatItemProps> = ({ label, value, change, changeColor = 'neutral' }) => {
  const colorClass = {
    green: 'text-green-600',
    red: 'text-red-600',
    neutral: 'text-gray-500',
  }[changeColor];

  return (
    <div className="flex flex-col items-start justify-center p-3 bg-white rounded-lg min-w-[140px]">
      <div className="text-sm font-medium text-gray-500 tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-medium text-[#11181C] mb-1">{value}</div>
      <div className={`text-xs ${colorClass} font-medium`}>
        {change}&nbsp;
        <span className="text-[#A1A1AA]">vs last month</span>
      </div>
    </div>
  );
};

const AttendanceSummary: React.FC = () => {
  const stats = [
    {
      label: 'Ngày nghỉ',
      value: 4,
      change: '+12',
      changeColor: 'green',
    },
    {
      label: 'Chấm công muộn',
      value: 4,
      change: '+12',
      changeColor: 'green',
    },
    {
      label: 'Về sớm',
      value: 4,
      change: '-2',
      changeColor: 'red',
    },
    {
      label: 'Quên chấm công',
      value: '4', // giữ nguyên định dạng trong ảnh
      change: '-2',
      changeColor: 'red',
    },
    {
      label: 'Số phép còn lại',
      value: 1,
      change: '0',
      changeColor: 'neutral',
    },
    {
      label: 'Nghỉ không phép',
      value: 4,
      change: '-2',
      changeColor: 'red',
    },
  ];

  return (
    <div className="w-full">
      {/* Grid các chỉ số */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-b-[14px] gap-4 px-6 py-1.5 bg-white border border-t-0 border-gray-200">
        {stats.map((stat, index) => (
          <div className="flex items-center" key={index}>
            {index !== 0 && <div className="w-px h-full bg-[#E4E4E7]" />}
            <StatItem
              label={stat.label}
              value={stat.value}
              change={stat.change}
              changeColor={stat.changeColor as 'green' | 'red' | 'neutral'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummary;
