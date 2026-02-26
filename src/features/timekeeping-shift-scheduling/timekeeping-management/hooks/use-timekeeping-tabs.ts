import { useState } from 'react';

import { tabs } from '../constants/data';
import { TAB_KEYS } from '../types/index.type';

export const useTimekeepingTabs = () => {
  const [activeKey, setActiveKey] = useState<TAB_KEYS>(TAB_KEYS.WORKSHEET_BY_SHIFT);

  const activeTab = tabs.find((tab) => tab.key === activeKey)!;

  return {
    tabs,
    activeKey,
    activeTab,
    setActiveKey,
  };
};
