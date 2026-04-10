import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';

import { useModal } from '@/store/useModal';

import { MODAL_CONFIG } from './modal.config';

export function MainModal() {
  const { isOpen, type, onClose } = useModal();

  if (!type) return null;

  const config = MODAL_CONFIG[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...config.modalProps}>
      <ModalContent>
        {config.title && (
          <ModalHeader className="text-base font-semibold text-[#11181C]">
            {config.title}
          </ModalHeader>
        )}
        <ModalBody className="p-0">{config.component}</ModalBody>
      </ModalContent>
    </Modal>
  );
}
