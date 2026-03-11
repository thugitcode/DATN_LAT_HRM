import { useState } from 'react';

import { useQueryFilter } from '@/hooks/useQueryFilter';

import { getTabs, tabs } from '../constants/data';
import { TAB_KEYS } from '../types/index.type';
import { useTimekeepingTranslation } from './use-timekeeping-translation';

export const useTimekeepingTabs = () => {
  const { clearFilters } = useQueryFilter();
  const { t } = useTimekeepingTranslation();

  const [activeKey, setActiveKey] = useState<TAB_KEYS>(TAB_KEYS.WORKSHEET_BY_SHIFT);

  const tabs = getTabs(t);

  const activeTab = tabs.find((tab) => tab.key === activeKey)!;

  const onSelectionChange = (k: TAB_KEYS) => {
    setActiveKey(k);
    clearFilters();
  };

  return {
    tabs,
    activeKey,
    activeTab,
    setActiveKey,
    onSelectionChange,
  };
};
