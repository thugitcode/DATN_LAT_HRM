import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RightMenuItemProps {
  label: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
}

export const RightMenuItem = ({ label, icon, href, active }: RightMenuItemProps) => {
  return (
    <a
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 w-full py-3 px-1 cursor-pointer',
        'text-[10px] font-medium leading-tight text-center transition-colors',
        active
          ? 'text-[#6576FF] bg-[#F0F1FF]'
          : 'text-[#71717A] hover:text-[#6576FF] hover:bg-[#F4F4F5]',
      )}
    >
      <span className={cn(active ? 'text-[#6576FF]' : 'text-[#71717A]')}>{icon}</span>
      <span>{label}</span>
    </a>
  );
};
