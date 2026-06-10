import { useSidebarStore } from '@/store/useSidebarStore';
import { Button } from '@heroui/react';

import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

export const ToggleSidebar = () => {
  const { isCollapsed, toggle } = useSidebarStore((state) => state);

  return (
    <div className="flex items-center justify-center">
      <Button
        isIconOnly
        onPress={toggle}
        className={cn(
          'size-8 rounded-sm bg-transparent text-[#8F99D3] hover:bg-primary hover:text-white duration-300 transition-all',
          isCollapsed && 'rotate-180',
        )}
      >
        {/* {isCollapsed ? icons.arrowToggleSidebarLeft : icons.arrowToggleSidebarLeft} */}

        {icons.arrowToggleSidebarLeft}
      </Button>
    </div>
  );
};
