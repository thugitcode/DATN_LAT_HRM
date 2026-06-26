import { useSidebarStore } from '@/store/useSidebarStore';

import { cn } from '@/lib/utils';

import { MainSidebarFooter } from './main-sidebar-footer';
import { MainSidebarNav } from './main-sidebar-nav';
import { ToggleSidebar } from './toggle-sidebar';
import logoFull from '@public/images/logo-hrm-full.svg'
import logo from '@public/images/logo-hrm-icon.svg'
import { Image } from '@heroui/react';
export const MainSidebar = () => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <div
      className={cn(
        'bg-[#2C3782] flex flex-col justify-between shadow-[0_1px_3px_0_#0000001A]  pt-6 transition-all duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'w-16 px-1.5' : 'w-72 px-3',
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <Image src={isCollapsed ? logo : logoFull} alt="logo" width={isCollapsed ? 52 : 240} height={isCollapsed ? 52 : 120} className='object-contain' />
        <ToggleSidebar />
        <MainSidebarNav isCollapsed={isCollapsed} />
      </div>
      <MainSidebarFooter />
    </div>
  );
};