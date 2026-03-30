import type { FC, ReactNode } from 'react';
import { Spinner } from '@heroui/react';

import { cn } from '@/lib/utils';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
  height?: string;
}

export const LoadingWrapper: FC<LoadingWrapperProps> = ({ isLoading, children, className, height }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center size-full" style={{ height }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return <div className={cn('size-full', className)}>{children}</div>;
};
