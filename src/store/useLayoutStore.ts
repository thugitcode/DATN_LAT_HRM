import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LayoutSwitcherEnum } from '@/types/global.type';

interface LayoutState {
  layouts: Record<string, LayoutSwitcherEnum>;
  setLayout: (path: string, layout: LayoutSwitcherEnum) => void;
  getLayout: (path: string) => LayoutSwitcherEnum;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      layouts: {},
      setLayout: (path, layout) =>
        set((state) => ({
          layouts: { ...state.layouts, [path]: layout },
        })),
      getLayout: (path) => get().layouts[path] || LayoutSwitcherEnum.LIST,
    }),
    {
      name: 'layout-storage',
    },
  ),
);
