// stores/timeAttendanceTabs.store.ts
import { create } from "zustand"
import { TAB_KEYS, tabs } from "../contants/data"
import { useMemo } from "react"

type TimeAttendanceTabsState = {
  activeKey: TAB_KEYS
  setActiveKey: (key: TAB_KEYS) => void
}

export const useTimeAttendanceTabsStore = create<TimeAttendanceTabsState>((set) => ({
  activeKey: TAB_KEYS.WORKSHEET_BY_SHIFT,
  setActiveKey: (key) => set({ activeKey: key }),
}))


export const useTimeAttendanceTabs = () => {
  const activeKey = useTimeAttendanceTabsStore((s) => s.activeKey)
  const setActiveKey = useTimeAttendanceTabsStore((s) => s.setActiveKey)

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeKey)!,
    [activeKey]
  )

  return {
    tabs,
    activeKey,
    activeTab,
    setActiveKey,
  }
}