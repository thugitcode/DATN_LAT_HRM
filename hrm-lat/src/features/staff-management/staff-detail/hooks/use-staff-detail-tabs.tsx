import { useState, useEffect } from "react";
import { staffTabs, TAB_KEYS } from "../types";

export const useStaffDetailTabs = () => {
  // Đọc tab từ URL khi load, mặc định là INFO
  const getInitialTab = (): TAB_KEYS => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as TAB_KEYS;
    return Object.values(TAB_KEYS).includes(tab) ? tab : TAB_KEYS.INFO;
  };

  const [activeKey, setActiveKey] = useState<TAB_KEYS>(getInitialTab);

  const onSelectionChange = (k: TAB_KEYS) => {
    setActiveKey(k as TAB_KEYS);
    // Lưu tab vào URL để F5 không bị reset
    const url = new URL(window.location.href);
    url.searchParams.set('tab', k);
    window.history.replaceState({}, '', url.toString());
  };

  const activeTab = staffTabs.find((tab) => tab.key === activeKey)!;

  return {
    staffTabs,
    activeKey,
    activeTab,
    setActiveKey,
    onSelectionChange,
  };
};