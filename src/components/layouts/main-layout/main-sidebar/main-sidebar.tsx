import { useSidebarStore } from '@/store/useSidebarStore';

import { cn } from '@/lib/utils';

import { MainSidebarFooter } from './main-sidebar-footer';
import { MainSidebarNav } from './main-sidebar-nav';
import { ToggleSidebar } from './toggle-sidebar';

export const MainSidebar = () => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <div
      className={cn(
        'bg-white flex flex-col justify-between shadow-[0_1px_3px_0_#0000001A]  pt-6 transition-all duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'w-16 px-1.5' : 'w-64 px-3',
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <ToggleSidebar />
        <MainSidebarNav isCollapsed={isCollapsed} />
      </div>
      <MainSidebarFooter />
    </div>
  );
};
