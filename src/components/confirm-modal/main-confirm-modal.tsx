'use client';

import { useConfirmStore } from '@/store/useConfirmStore';

import { ConfirmModal } from './confirm-modal';

export const MainConfirmModal = () => {
  const { isOpen, config, reason, setReason, isLoading, setLoading, close, onConfirm } =
    useConfirmStore((state) => state);

  if (!config || !onConfirm) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(config.requireReason ? reason : undefined);
    setLoading(false);
    close();
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      config={config}
      reason={reason}
      isLoading={isLoading}
      onReasonChange={setReason}
      onConfirm={handleConfirm}
      onClose={close}
    />
  );
};
