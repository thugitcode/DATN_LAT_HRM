import { create } from 'zustand';

export enum DrawerType {
  WORK_SHIFTS = 'WORK_SHIFTS',
  CHANGE_SHIFT_DIVISION = 'CHANGE_SHIFT_DIVISION',
  EXPLANATION_DETAIL = 'EXPLANATION_DETAIL',
}

interface DrawerState {
  isOpen: boolean;
  type: DrawerType | null;
  data: unknown;

  onOpen: <D = unknown>(type: DrawerType, data?: D) => void;
  onClose: () => void;
}

export const useDrawer = create<DrawerState>((set) => ({
  isOpen: false,
  type: null,
  data: undefined,

  onOpen: (type, data) =>
    set({
      isOpen: true,
      type,
      data,
    }),

  onClose: () =>
    set({
      isOpen: false,
      type: null,
      data: undefined,
    }),
}));
