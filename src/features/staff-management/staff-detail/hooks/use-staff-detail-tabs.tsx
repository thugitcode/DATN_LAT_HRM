import { useState } from "react";
import { staffTabs, TAB_KEYS } from "../types";

export const useStaffDetailTabs = () => {
  const [activeKey, setActiveKey] = useState<TAB_KEYS>(TAB_KEYS.INFO);

  const activeTab = staffTabs.find((tab) => tab.key === activeKey)!;

  const onSelectionChange = (k: TAB_KEYS) => {
    setActiveKey(k);
  };

  return {
    staffTabs,
    activeKey,
    activeTab,
    setActiveKey,
    onSelectionChange,
  };
};
