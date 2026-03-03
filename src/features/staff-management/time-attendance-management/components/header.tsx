import { Button } from '@heroui/react';
import { Tab, Tabs } from '@heroui/tabs';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';

import type { TAB_KEYS } from '../contants/data';
import { useTimeAttendanceTabs } from '../hooks/use-time-attendance-tabs';

export const Header = () => {
  const { tabs, activeKey, setActiveKey } = useTimeAttendanceTabs();

  const startDate = new Date('2026-03-01');
  const endDate = new Date('2026-03-02');
  return (
    <div className="flex w-full flex-col">
      <div className="h-16 bg-[#E4E4E7] p-4 rounded-t-xl flex justify-between items-center">
        <Tabs
          aria-label="Timekeeping tabs"
          // variant="underlined"
          classNames={{ tab: 'data-[selected=true]:bg-black' }}
          color="primary"
          selectedKey={activeKey}
          onSelectionChange={(key) => {
            setActiveKey(key as TAB_KEYS)
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} title={tab.label} />
          ))}
        </Tabs>
        <div className='text-[18px] font-semibold'>
          {dayjs(startDate).format('DD/MM/YYYY')} - {dayjs(endDate).format('DD/MM/YYYY')}
        </div>
        <div className='flex gap-2'>
          <Button isIconOnly className='bg-white' radius='full'>
            <IconChevronLeft />
          </Button>
          <Button isIconOnly className='bg-white' radius='full'>
            <IconChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
