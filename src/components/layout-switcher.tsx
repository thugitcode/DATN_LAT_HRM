import { Tooltip } from '@heroui/react';
import { Tab, Tabs } from '@heroui/tabs';

import { LayoutSwitcherEnum } from '@/types/global.type';
import { icons } from '@/lib/icons';

export const LayoutSwitcher = () => {
  return (
    <Tabs
      aria-label="layout-switcher"
      variant={'solid'}
      className=""
      classNames={{
        base: 'rounded-lg shadow-[0_1px_2px_0_#0000000D]',
        tabList: 'bg-white',
        tabContent: 'p-0',
        tab: 'p-0',
        cursor: 'bg-primary',
      }}
    >
      <Tab
        key={LayoutSwitcherEnum.LIST}
        title={
          <Tooltip content="Dạng danh sách" showArrow={true}>
            <span className="border-none rounded-lg flex items-center justify-center size-8 text-[#52525B] data-[selected=true]:bg-primary data-[selected=true]:text-white transition-colors">
              {icons.net}
            </span>
          </Tooltip>
        }
      />
      <Tab
        key={LayoutSwitcherEnum.GRID}
        title={
          <Tooltip content="Dạng danh lưới" showArrow={true}>
            <span className="border-none rounded-lg flex items-center justify-center size-8 text-[#52525B] data-[selected=true]:bg-primary data-[selected=true]:text-white transition-colors">
              {icons.grib}
            </span>
          </Tooltip>
        }
      />
    </Tabs>
  );
};
