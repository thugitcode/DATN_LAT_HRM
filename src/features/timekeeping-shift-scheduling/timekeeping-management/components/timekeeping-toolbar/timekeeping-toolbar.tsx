import type { FC } from 'react';
import { Button, Tab, Tabs, Tooltip } from '@heroui/react';

import { icons } from './icons';

interface TimekeepingToolbarProps {
  title?: string;
}

export const TimekeepingToolbar: FC<Readonly<TimekeepingToolbarProps>> = ({ title }) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[#11181C] text-3xl leading-9 font-semibold tracking-normal">{title}</h2>

      <div className="flex items-stretch gap-3">
        <ul className="flex items-center gap-2">
          <li>
            <Tooltip content="Tải lại" showArrow={true}>
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

        <Tabs
          aria-label="Tabs layout"
          variant={'solid'}
          //   color="success"
          className=""
          classNames={{
            base: ' rounded-lg',
            tabList: 'bg-white ',
            tabContent: 'p-0',
            tab: 'p-0',
          }}
        >
          <Tab
            key="photos"
            title={
              <Tooltip content="Tải lại" showArrow={true}>
                <span className="border-none bg-[#D4D4D866] rounded-lg flex items-center justify-center size-8">
                  {icons.net}
                </span>
              </Tooltip>
            }
          />
          <Tab key="music" title={icons.grib} />
        </Tabs>

        <span className="inline-block w-0.5 bg-[#11111126] flex-1" />
      </div>
    </div>
  );
};
