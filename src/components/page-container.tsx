import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'fixed' | 'scroll';
}

export const PageContainer = forwardRef<HTMLDivElement, Readonly<PageContainerProps>>(
  ({ children, className, variant = 'scroll' }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 pt-6 size-full',
          {
            'overflow-hidden': variant === 'fixed',
            'overflow-auto': variant === 'scroll',
          },
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

PageContainer.displayName = 'PageContainer';
