import React from 'react';
import { Divider } from '@heroui/react';

import { Status } from '@/types/global.type';
import { formatVND } from '@/lib/helpers';
import { cn } from '@/lib/utils';

import type { PayPeriod } from './pay-periods-list';

const STATUS_CONFIG = {
  [Status.ACTIVE]: {
    label: 'Đã duyệt',
    className: 'bg-[#17C96433] text-[#17C964]',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.99935 1.66663C5.40768 1.66663 1.66602 5.40829 1.66602 9.99996C1.66602 14.5916 5.40768 18.3333 9.99935 18.3333C14.591 18.3333 18.3327 14.5916 18.3327 9.99996C18.3327 5.40829 14.591 1.66663 9.99935 1.66663ZM13.9827 8.08329L9.25768 12.8083C9.14102 12.925 8.98268 12.9916 8.81602 12.9916C8.64935 12.9916 8.49102 12.925 8.37435 12.8083L6.01602 10.45C5.77435 10.2083 5.77435 9.80829 6.01602 9.56663C6.25768 9.32496 6.65768 9.32496 6.89935 9.56663L8.81602 11.4833L13.0993 7.19996C13.341 6.95829 13.741 6.95829 13.9827 7.19996C14.2243 7.44163 14.2243 7.83329 13.9827 8.08329Z"
          fill="#17C964"
        />
      </svg>
    ),
  },

  [Status.PENDING]: {
    label: 'Đang xử lý',
    className: 'bg-[#006FEE33] text-[#006FEE]',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M18.3327 9.99996C18.3327 14.6023 14.6017 18.3333 9.99935 18.3333C5.39698 18.3333 1.66602 14.6023 1.66602 9.99996C1.66602 5.39759 5.39698 1.66663 9.99935 1.66663C14.6017 1.66663 18.3327 5.39759 18.3327 9.99996ZM4.54981 9.23607C4.86044 6.49986 7.18605 4.37496 10.0073 4.37496C11.7893 4.37496 13.3734 5.22323 14.3761 6.53534C14.5856 6.80961 14.5332 7.20185 14.2589 7.41143C13.9847 7.62101 13.5924 7.56857 13.3828 7.2943C12.6068 6.27866 11.3837 5.62496 10.0073 5.62496C7.87612 5.62496 6.11301 7.19345 5.81043 9.23607H6.11312C6.36598 9.23607 6.59394 9.38844 6.69062 9.62209C6.78731 9.85574 6.73368 10.1246 6.55476 10.3033L5.58121 11.2755C5.3372 11.5192 4.94194 11.5192 4.69793 11.2755L3.72438 10.3033C3.54545 10.1246 3.49182 9.85574 3.58851 9.62209C3.6852 9.38844 3.91315 9.23607 4.16602 9.23607H4.54981ZM15.3008 8.72438C15.0568 8.48071 14.6615 8.48071 14.4175 8.72438L13.444 9.6966C13.265 9.87529 13.2114 10.1442 13.3081 10.3778C13.4048 10.6115 13.6327 10.7638 13.8856 10.7638H14.1883C13.8857 12.8065 12.1226 14.375 9.99139 14.375C8.62139 14.375 7.40338 13.7273 6.62677 12.7198C6.41604 12.4464 6.02358 12.3956 5.75019 12.6064C5.47681 12.8171 5.42601 13.2095 5.63674 13.4829C6.64007 14.7846 8.21773 15.625 9.99139 15.625C12.8127 15.625 15.1383 13.5001 15.4489 10.7638H15.8327C16.0856 10.7638 16.3135 10.6115 16.4102 10.3778C16.5069 10.1442 16.4533 9.87529 16.2743 9.6966L15.3008 8.72438Z"
          fill="#006FEE"
        />
      </svg>
    ),
  },
};

export const PayPeriodsCard: React.FC<{ data: PayPeriod }> = ({ data }) => {
  const { month, employeeCount, totalCost, status } = data;
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="bg-white rounded-xl hover:shadow-sm transition-shadow duration-200 cursor-pointer">
      <div className="flex items-center justify-between p-3">
        <span className="font-semibold text-gray-900 text-sm">Tháng {month}</span>
        <span
          className={cn(
            `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium`,
            cfg.className,
          )}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      <Divider orientation="horizontal" />

      <div className="flex gap-6 py-1.5">
        <div className="p-3 space-y-1">
          <p className="text-xs text-gray-400 ">Nhân viên:</p>
          <p className="text-sm font-medium text-gray-700">{employeeCount} người</p>
        </div>
        <div className="p-3 space-y-1">
          <p className="text-xs text-gray-400 ">Tổng chi phí:</p>
          <p className="text-sm font-medium text-gray-700">{formatVND(totalCost)}</p>
        </div>
      </div>
    </div>
  );
};
