import type { ReactNode } from 'react';
import { create } from 'zustand';

import { EConfirmType } from '@/types';

interface ConfirmState {
  opened: boolean;
  title?: string;
  message?: string | ReactNode;
  type: EConfirmType;
  isLoading?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  openConfirm: (opts: {
    type: EConfirmType;
    title?: string;
    message?: string | ReactNode;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
  closeConfirm: () => void;
  setLoadingConfirm: (loading: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  opened: false,
  title: '',
  message: '',
  onConfirm: undefined,
  onCancel: undefined,
  type: EConfirmType.INFO,
  isLoading: false,

  setLoadingConfirm: (loading) =>
    set({
      isLoading: loading,
    }),

  openConfirm: (opts) =>
    set({
      opened: true,
      ...opts,
    }),

  closeConfirm: () =>
    set({
      opened: false,
      title: '',
      message: '',
      isLoading: false,
      onConfirm: undefined,
      onCancel: undefined,
      type: EConfirmType.INFO,
    }),
}));
