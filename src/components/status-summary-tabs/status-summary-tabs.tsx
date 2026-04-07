import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StatusSummaryTabsProps {
  className?: string;
  children: ReactNode;
}

export const StatusSummaryTabs: FC<Readonly<StatusSummaryTabsProps>> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('p-3 rounded-xl bg-white shadow-sm', className)}>{children}</div>
  );
};
