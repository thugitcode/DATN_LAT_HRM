'use client';

import type { FC } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';

import type { ConfirmConfig } from './type';

interface ConfirmModalProps {
  isOpen: boolean;
  config: ConfirmConfig;
  reason: string;
  isLoading: boolean;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const MAX_REASON_LENGTH = 500;

export const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  config,
  reason,
  isLoading,
  onReasonChange,
  onConfirm,
  onClose,
}) => {
  const isOverLimit = reason.length > MAX_REASON_LENGTH;
  const isReasonEmpty = config.requireReason && reason.trim().length === 0;
  const isConfirmDisabled = isOverLimit || isReasonEmpty;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
      size="sm"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <IconAlertTriangle
            size={20}
            className={config.confirmColor === 'danger' ? 'text-danger' : 'text-primary'}
          />
          <span>{config.title}</span>
        </ModalHeader>

        <ModalBody className="gap-3">
          <p className="text-sm text-default-600">{config.description}</p>

          {config.requireReason && (
            <Textarea
              autoFocus
              label="Lý do từ chối"
              placeholder="Nhập lý do từ chối..."
              value={reason}
              onValueChange={onReasonChange}
              isDisabled={isLoading}
              isInvalid={isOverLimit}
              errorMessage={isOverLimit ? `Tối đa ${MAX_REASON_LENGTH} ký tự` : undefined}
              description={!isOverLimit ? `${reason.length}/${MAX_REASON_LENGTH}` : undefined}
              minRows={3}
              maxRows={5}
              classNames={{ label: 'text-sm font-medium' }}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" isDisabled={isLoading} onPress={onClose}>
            Hủy
          </Button>
          <Button
            color={config.confirmColor}
            isLoading={isLoading}
            isDisabled={isConfirmDisabled}
            startContent={
              !isLoading &&
              (config.confirmColor === 'danger' ? <IconX size={16} /> : <IconCheck size={16} />)
            }
            onPress={onConfirm}
          >
            {config.confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
