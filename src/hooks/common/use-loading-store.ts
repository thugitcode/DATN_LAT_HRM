import { create } from 'zustand';

type LoadingOptions = {
  timeout?: number;          // ms
  message?: string;
  onTimeout?: () => void;
  onCancel?: () => void;
};

type LoadingState = {
  loadingCount: number;
  message?: string;
  timeoutId?: number;
  onCancel?: () => void;

  show: (options?: LoadingOptions) => void;
  hide: () => void;
  reset: () => void;
};

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingCount: 0,

  show: (options) => {
    const {
      timeout = 30_000,
      message = 'Đang xử lý...',
      onTimeout,
      onCancel,
    } = options ?? {};

    const count = get().loadingCount;

    if (count === 0) {
      let timeoutId: number | undefined;

      if (timeout > 0) {
        timeoutId = window.setTimeout(() => {
          onTimeout?.();
          get().reset();
        }, timeout);
      }

      set({
        loadingCount: 1,
        message,
        timeoutId,
        onCancel,
      });
    } else {
      set({ loadingCount: count + 1 });
    }
  },

  hide: () => {
    const count = get().loadingCount;

    if (count <= 1) {
      get().reset();
    } else {
      set({ loadingCount: count - 1 });
    }
  },

  reset: () =>
    set((state) => {
      if (state.timeoutId) clearTimeout(state.timeoutId);
      return {
        loadingCount: 0,
        message: undefined,
        timeoutId: undefined,
        onCancel: undefined,
      };
    }),
}));
