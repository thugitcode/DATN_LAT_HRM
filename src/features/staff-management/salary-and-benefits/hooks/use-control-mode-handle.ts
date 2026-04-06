import { create } from "zustand";
import type { SalaryFormValues } from "../schemas";

export enum ControlMode { view = "view", edit = "edit", create = "create" };

type ControlModeState<T> = {
  mode: ControlMode;
  data?: T;
  isReadOnly: boolean;

  setMode: (mode: ControlMode, data?: T) => void;
  setReadOnly: (value: boolean) => void;
  reset: () => void;
};

export const createControlMode = <T>() => {
  const useStore = create<ControlModeState<T>>((set, get) => ({
    mode: ControlMode.view,
    data: undefined,
    isReadOnly: false,

    setMode: (mode, data) => {
      if (get().isReadOnly) return;
      set({ mode, data });
    },

    setReadOnly: (value) => set({ isReadOnly: value, mode: ControlMode.view }),

    reset: () => set({ mode: ControlMode.view, data: undefined }),
  }));

  return () => {
    const state = useStore();

    return {
      ...state,
      isView: state.isReadOnly || state.mode === ControlMode.view,
      isEdit: !state.isReadOnly && state.mode === ControlMode.edit,
      isCreate: !state.isReadOnly && state.mode === ControlMode.create,
    };
  };
};

export const useControlMode = createControlMode<any>();