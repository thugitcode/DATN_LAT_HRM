import { Button } from '@heroui/react';
import { Tab, Tabs } from '@heroui/tabs';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';

import type { TAB_KEYS } from '../contants/data';
import { useTimeAttendanceTabs } from '../hooks/use-time-attendance-tabs';
import type { ShiftManagementParams } from '@/types';
import { useQueryFilter } from '@/hooks/useQueryFilter';

export const Header = () => {
  const { tabs, activeKey, setActiveKey } = useTimeAttendanceTabs();
  const { filters, setFilter, clearFilters } = useQueryFilter<ShiftManagementParams>();

  const currentMonth = dayjs(filters?.month || dayjs().format("YYYY-MM"));

  const startDate = currentMonth.startOf("month");
  const endDate = currentMonth.endOf("month");

  const handlePrevMonth = () => {
    const prev = currentMonth.subtract(1, "month").format("YYYY-MM");

    setFilter("month", prev);
  };

  const handleNextMonth = () => {
    const next = currentMonth.add(1, "month").format("YYYY-MM");
    setFilter("month", next);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="h-16 bg-[#E4E4E7] p-4 rounded-t-xl flex justify-between items-center">
        <Tabs
          aria-label="Timekeeping tabs"
          classNames={{ tab: "data-[selected=true]:bg-black" }}
          color="primary"
          selectedKey={activeKey}
          onSelectionChange={(key) => {
            setActiveKey(key as TAB_KEYS);
            // clearFilters()
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} title={tab.label} />
          ))}
        </Tabs>

        <div className="text-[18px] font-semibold">
          {startDate.format("DD/MM/YYYY")} - {endDate.format("DD/MM/YYYY")}
        </div>

        <div className="flex gap-2">
          <Button
            isIconOnly
            className="bg-white"
            radius="full"
            onPress={handlePrevMonth}
          >
            <IconChevronLeft />
          </Button>

          <Button
            isIconOnly
            className="bg-white"
            radius="full"
            onPress={handleNextMonth}
          >
            <IconChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
