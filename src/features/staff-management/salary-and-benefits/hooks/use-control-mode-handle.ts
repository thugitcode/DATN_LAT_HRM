import { create } from "zustand";
import type { SalaryFormValues } from "../schemas";

export enum ControlMode { view = "view", edit = "edit", create = "create" };

type ControlModeState<T> = {
  mode: ControlMode;
  data?: T;

  setMode: (mode: ControlMode, data?: T) => void;
  reset: () => void;
};

export const createControlMode = <T>() => {
  const useStore = create<ControlModeState<T>>((set) => ({
    mode: ControlMode.view,
    data: undefined,

    setMode: (mode, data) => set({ mode, data }),

    reset: () => set({ mode: ControlMode.view, data: undefined }),
  }));

  return () => {
    const state = useStore();

    return {
      ...state,
      isView: state.mode === ControlMode.view,
      isEdit: state.mode === ControlMode.edit,
      isCreate: state.mode === ControlMode.create,
    };
  };
};

export const useControlMode = createControlMode<any>();