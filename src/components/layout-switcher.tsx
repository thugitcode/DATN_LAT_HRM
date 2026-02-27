import { useLocation } from '@tanstack/react-router';
import { useLayoutStore } from '@/store/useLayoutStore';
import { Tooltip } from '@heroui/react';
import { Tab, Tabs } from '@heroui/tabs';

import { LayoutSwitcherEnum } from '@/types/global.type';
import { icons } from '@/lib/icons';

export const LayoutSwitcher = () => {
  const { pathname = '/' } = useLocation();
  const { getLayout, setLayout } = useLayoutStore();

  const currentLayout = getLayout(pathname);

  return (
    <Tabs
      aria-label="layout-switcher"
      selectedKey={currentLayout}
      onSelectionChange={(key) => setLayout(pathname, key as LayoutSwitcherEnum)}
      variant="solid"
      classNames={{
        base: 'rounded-lg shadow-sm',
        tabList: 'bg-white p-1',
        tab: `
      p-0
      size-8
      min-w-8
      rounded-lg
      data-[selected=true]:bg-primary
      transition-colors
    `,
        tabContent: `
      flex items-center justify-center
      text-[#52525B]
      group-data-[selected=true]:!text-white
    `,
        cursor: 'bg-primary rounded-lg',
      }}
    >
      <Tab
        key={LayoutSwitcherEnum.LIST}
        aria-label="layout-list"
        title={
          <Tooltip content="Dạng danh sách" offset={20} showArrow>
            {icons.net}
          </Tooltip>
        }
      />

      <Tab
        key={LayoutSwitcherEnum.GRID}
        aria-label="layout-grid"
        title={
          <Tooltip content="Dạng lưới" offset={20} showArrow>
            {icons.grib}
          </Tooltip>
        }
      />
    </Tabs>
  );
};
