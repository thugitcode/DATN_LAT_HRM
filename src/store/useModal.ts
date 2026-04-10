import { create } from 'zustand';

export enum ModalType {
  RESEND_MAIL = 'RESEND_MAIL',
}

interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  data: unknown;

  onOpen: <D = unknown>(type: ModalType, data?: D) => void;
  onClose: () => void;
}

export const useModal = create<ModalState>((set) => ({
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
