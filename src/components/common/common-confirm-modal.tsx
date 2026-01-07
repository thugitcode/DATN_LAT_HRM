import { Button, Card, Group, Modal, Text } from '@mantine/core';
import type { ExtendedCustomColors } from '@/mantine';

import { EConfirmType } from '@/types';
import { useConfirmStore } from '@/hooks/common/use-confirm-store';

export const ConfirmModal = () => {
  const { opened, title, message, onConfirm, onCancel, closeConfirm, type, isLoading } =
    useConfirmStore();

  const handleConfirm = async () => {
    await onConfirm?.();
    // closeConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    closeConfirm();
  };

  const colorMap: Record<EConfirmType, ExtendedCustomColors> = {
    [EConfirmType.DANGER]: 'danger',
    [EConfirmType.INFO]: 'primary',
  };

  const color = colorMap[type];

  return (
    <Modal
      size={685}
      styles={{
        title: { width: '100%' },
        body: { padding: 24 },
        header: { padding: 24, paddingBottom: 0 },
      }}
      centered
      opened={opened}
      onClose={handleCancel}
      title={
        <Text fw={600} fz={28} w="100%" c={color} ta="center">
          {title || 'Xác nhận'}
        </Text>
      }
      withCloseButton={false}
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      zIndex={500}
      radius="md"
    >
      <Card padding="12px" mb={34} radius="md" withBorder bg="cultured">
        <Text mb="md" ta="center">
          {message || 'Bạn có chắc muốn tiếp tục?'}
        </Text>
      </Card>

      <Group justify="center">
        <Button
          radius={10}
          variant="outline"
          color={color}
          onClick={handleCancel}
          disabled={isLoading}
        >
          Quay lại
        </Button>

        <Button radius={10} color={color} onClick={handleConfirm} loading={isLoading}>
          Xác nhận
        </Button>
      </Group>
    </Modal>
  );
};
