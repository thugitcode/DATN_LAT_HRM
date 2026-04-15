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
        'flex flex-col size-[90px]! items-center justify-center gap-1 w-full py-3 px-4 cursor-pointer',
        'text-[13px] font-medium leading-tight text-center transition-colors font-["Quicksand",sans-serif]',
        active
          ? 'text-[#6576FF] bg-white shadow-[-14px_20px_40px_rgba(0,0,0,0.15),0_6px_20px_rgba(0,0,0,0.15)]!'
          : 'text-[#2c3782] hover:shadow-[-14px_20px_40px_rgba(0,0,0,0.15),0_6px_20px_rgba(0,0,0,0.15)]! hover:text-[#6576FF] hover:bg-[#F4F4F5]',
      )}
    >
      <span className={cn(active ? 'text-[#6576FF]' : 'text-[#2c3782]')}>{icon}</span>
      <span>{label}</span>
    </a>
  );
};
