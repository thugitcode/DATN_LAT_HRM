import { useEffect } from 'react';
import { Center, Loader, Overlay, Stack, Text } from '@mantine/core';
import { useLoadingStore } from '@/hooks/common/use-loading-store';

export const GlobalLoading = () => {
  const { loadingCount, message, onCancel, reset } = useLoadingStore();

  const visible = loadingCount > 0;

  useEffect(() => {
    if (!visible) return;

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel?.();
        reset();
      }
    };

    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [visible, onCancel, reset]);

  if (!visible) return null;

  return (
    <Overlay zIndex={9999} blur={2} bg={'rgb(255 255 255 / 45%)'} backgroundOpacity={0.3}>
      <Center h="100%">
        <Stack align="center" gap={12}>
          <Loader size="lg" />
          <Text size="sm">{message}</Text>
          <Text size="xs" c="dimmed">
            Nhấn ESC để huỷ
          </Text>
        </Stack>
      </Center>
    </Overlay>
  );
};
