import type { FC, ReactNode } from 'react';
import { Button } from '@heroui/react';

import { cn } from '@/lib/utils';

interface WrapperIconSidebarProps {
  className?: string;
  children: ReactNode;
}

export const WrapperIconSidebar: FC<Readonly<WrapperIconSidebarProps>> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('flex items-center justify-center size-12 rounded-lg', className)}>
      {children}
    </div>
  );
};
