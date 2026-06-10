import { create } from 'zustand';

import type { ConfirmConfig } from '@/components/confirm-modal/type';

interface ConfirmState {
  isOpen: boolean;
  reason: string;
  isLoading: boolean;
  config: ConfirmConfig | null;
  onConfirm?: (reason?: string) => Promise<void>;

  open: (config: ConfirmConfig, onConfirm?: (reason?: string) => Promise<void>) => void;
  close: () => void;
  setReason: (value: string) => void;
  setLoading: (value: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  reason: '',
  isLoading: false,
  config: null,
  onConfirm: undefined,

  open: (config, onConfirm) =>
    set({ isOpen: true, config, reason: '', isLoading: false, onConfirm }),
  close: () =>
    set({ isOpen: false, config: null, reason: '', isLoading: false, onConfirm: undefined }),
  setReason: (value) => set({ reason: value }),
  setLoading: (value) => set({ isLoading: value }),
}));
