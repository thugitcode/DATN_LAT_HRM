import { useSidebarStore } from '@/store/useSidebarStore';
import { Button } from '@heroui/react';

import { icons } from '@/lib/icons';

export const ToggleSidebar = () => {
  const { isCollapsed, toggle } = useSidebarStore((state) => state);

  return (
    <div className="flex items-center justify-center">
      <Button isIconOnly onPress={toggle} className="size-8 rounded-sm bg-white hover:bg-gray-100">
        {isCollapsed ? icons.arrowToggleSidebarLeft : icons.arrowToggleSidebarLeft}
      </Button>
    </div>
  );
};
