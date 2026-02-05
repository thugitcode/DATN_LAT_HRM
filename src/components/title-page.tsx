import type { FC } from 'react';

import { cn } from '@/lib/utils';

interface TitlePageProps {
  title: string;
  className?: string;
}

export const TitlePage: FC<Readonly<TitlePageProps>> = ({ title, className }) => {
  return (
    <h2 className={cn('text-[30px] font-semibold leading-9 tracking-normal', className)}>
      {title}
    </h2>
  );
};
