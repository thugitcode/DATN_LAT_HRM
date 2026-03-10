// components/AttendanceSummary.tsx
import React from 'react';
import type { IAttendanceSummary } from '../types';

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
      {/* <div className={`text-xs ${colorClass} font-medium`}>
        {change}&nbsp;
        <span className="text-[#A1A1AA]">vs last month</span>
      </div> */}
    </div>
  );
};
interface AttendanceSummaryProps {
  data?: IAttendanceSummary;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ data }) => {
  // Fallback nếu data chưa kịp load
  if (!data) return <div className="p-6 text-gray-400 text-center">Không có dữ liệu</div>;

  const stats = [
    {
      label: 'Ngày nghỉ',
      value: data.dayOff,
      change: '0', // Tạm thời để 0 vì API chưa có field so sánh
      changeColor: 'neutral',
    },
    {
      label: 'Chấm công muộn',
      value: data.lateCount,
      change: '0',
      changeColor: 'neutral',
    },
    {
      label: 'Về sớm',
      value: data.earlyLeaveCount,
      change: '0',
      changeColor: 'neutral',
    },
    {
      label: 'Quên chấm công',
      value: data.missedCheckIn,
      change: '0',
      changeColor: 'neutral',
    },
    {
      label: 'Số phép còn lại',
      value: data.remainingLeave,
      change: '0',
      changeColor: 'neutral',
    },
    {
      label: 'Nghỉ không phép',
      value: data.unauthorizedLeave,
      change: '0',
      changeColor: 'neutral',
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-b-[14px] gap-4 px-6 py-1.5 bg-white border border-t-0 border-gray-200">
        {stats.map((stat, index) => (
          <div className="flex items-center" key={index}>
            {/* Divider chỉ hiện từ item thứ 2 trở đi trên màn hình lớn */}
            {index !== 0 && <div className="hidden lg:block w-px h-10 bg-[#E4E4E7]" />}
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
