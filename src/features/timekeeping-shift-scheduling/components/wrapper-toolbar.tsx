import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface WrapperToolBarProps {
  children: ReactNode;
  className?: string;
}

export const WrapperToolBar = forwardRef<HTMLDivElement, Readonly<WrapperToolBarProps>>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 pt-6 w-full',

          className,
        )}
      >
        {children}
      </div>
    );
  },
);

WrapperToolBar.displayName = 'WrapperToolBar';
