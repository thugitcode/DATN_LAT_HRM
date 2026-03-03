import type { FC } from 'react';

import { cn } from '@/lib/utils';

interface StatusSummaryItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  color: string;
  bgColor: string;
  className?: string;
}

export const StatusSummaryItem: FC<Readonly<StatusSummaryItemProps>> = ({
  bgColor,
  color,
  icon,
  label,
  count,
  className,
}) => {
  return (
    <div
      className={cn('flex flex-col items-start gap-1 rounded-lg px-4 py-2', className)}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span className="text-base font-medium text-black whitespace-nowrap">{label}</span>
      </div>
      <span className="text-2xl font-medium" style={{ color }}>
        {count}
      </span>
    </div>
  );
};
