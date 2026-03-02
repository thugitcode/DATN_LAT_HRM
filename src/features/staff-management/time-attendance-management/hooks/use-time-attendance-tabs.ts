import { useState } from 'react';

import { TAB_KEYS, tabs } from '../contants/data';

export const useTimeAttendanceTabs = () => {
  const [activeKey, setActiveKey] = useState<TAB_KEYS>(TAB_KEYS.WORKSHEET_BY_SHIFT);

  const activeTab = tabs.find((tab) => tab.key === activeKey)!;

  return {
    tabs,
    activeKey,
    activeTab,
    setActiveKey,
  };
};
