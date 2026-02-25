import type { FC } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button, Tooltip } from '@heroui/react';

import { icons } from '@/lib/icons';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { LayoutSwitcher } from './layout-switcher';

interface ActionsPageProps {}

export const ActionsPage: FC<Readonly<ActionsPageProps>> = () => {
  const onOpenDrawer = useDrawer((state) => state.onOpen);

  const { clearFilters } = useQueryFilter({
    replace: true,
  });

  const onReload = () => {
    clearFilters();
  };

  const onCreate = () => {
    onOpenDrawer(DrawerType.WORK_SHIFTS);
  };

  return (
    <div className="flex items-stretch gap-3">
      <ul className="flex items-center gap-2">
        <li>
          <Tooltip content="Tải lại" showArrow={true} onClick={onReload}>
            <Button
              isIconOnly
              aria-label="Take a reload"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
            >
              {icons.reload}
            </Button>
          </Tooltip>
        </li>
        <li>
          <Tooltip content="Xuất file" showArrow={true}>
            <Button
              isIconOnly
              aria-label="Take a export"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
            >
              {icons.export}
            </Button>
          </Tooltip>
        </li>
        <li>
          <Tooltip content="In" showArrow={true}>
            <Button
              isIconOnly
              aria-label="Take a print"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
            >
              {icons.print}
            </Button>
          </Tooltip>
        </li>
      </ul>

      <span className="inline-block w-0.5 bg-[#11111126] flex-1" />

      <LayoutSwitcher />

      <span className="inline-block w-0.5 bg-[#11111126] flex-1" />

      <Button onPress={onCreate} color="primary" className="h-10 px-4">
        Thêm phân ca
      </Button>
      {/* <Button color="secondary" className="h-10 px-4">
        Duyệt phân ca
      </Button> */}
    </div>
  );
};
