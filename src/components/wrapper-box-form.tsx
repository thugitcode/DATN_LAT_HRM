import type { FC, ReactNode } from 'react';
import { ca } from 'zod/v4/locales';

import { cn } from '@/lib/utils';

interface WrapperBoxFormProps {
  title?: string;
  children: ReactNode;
  classNames?: {
    title?: string;
    content?: string;
  };
}

export const WrapperBoxForm: FC<WrapperBoxFormProps> = ({ title, children, classNames }) => {
  return (
    <div className={cn('rounded-lg w-full shadow-[0_1px_2px_0_#0000000D] overflow-hidden')}>
      <div
        className={cn(
          'bg-[#E4E4E7] text-[16px] font-medium leading-6 text-left px-3 py-1.5',
          classNames?.title,
        )}
      >
        {title}
      </div>
      <div className={cn('p-3 bg-white', classNames?.content)}>{children}</div>
    </div>
  );
};
