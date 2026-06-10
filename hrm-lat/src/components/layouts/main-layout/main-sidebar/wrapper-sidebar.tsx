import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface WrapperSidebarProps {
  children: ReactNode;
  className?: string;
}

export const WrapperSidebar: FC<Readonly<WrapperSidebarProps>> = ({ children, className }) => {
  return <div className={cn('px-1.75 pt-6', className)}>{children}</div>;
};
