import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface WrapperLoadingProps {
  loading?: boolean;
  children: ReactNode;
  className?: string;
  spinnerClassName?: string;
  overlayClassName?: string;
}

export const WrapperLoading: FC<Readonly<WrapperLoadingProps>> = ({
  loading = false,
  children,
  className = '',
  spinnerClassName = '',
  overlayClassName = '',
}) => {
  if (!loading) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative h-full', className)}>
      <div className={cn(loading ? 'pointer-events-none select-none opacity-50 h-full' : 'h-full')}>
        {children}
      </div>

      <div
        className={cn(
          'absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm',
          overlayClassName,
        )}
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner className={spinnerClassName} />
      </div>
    </div>
  );
};

const Spinner: FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('relative size-8', className)}>
    <div className="absolute h-full w-full animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
  </div>
);
