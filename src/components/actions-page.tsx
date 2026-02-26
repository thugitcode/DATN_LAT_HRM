import type { FC, ReactNode } from 'react';
import { Button, Tooltip } from '@heroui/react';

import { icons } from '@/lib/icons';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { LayoutSwitcher } from './layout-switcher';

interface ActionsPageProps {
  actions?: ReactNode;
  hiddenLayoutSwitcher?: boolean;
}

export const ActionsPage: FC<Readonly<ActionsPageProps>> = ({
  actions,
  hiddenLayoutSwitcher = false,
}) => {
  const { clearFilters } = useQueryFilter({
    replace: true,
  });

  const onReload = () => {
    clearFilters();
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

      {!hiddenLayoutSwitcher && (
        <>
          <LayoutSwitcher />

          <span className="inline-block w-0.5 bg-[#11111126] flex-1" />
        </>
      )}

      {actions}
    </div>
  );
};
