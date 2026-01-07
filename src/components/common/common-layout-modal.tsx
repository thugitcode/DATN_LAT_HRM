import { ActionIcon, Box, Flex, Group, Modal, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

interface BaseModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: string | number;
}

export default function BaseModal({
  opened,
  onClose,
  title,
  subtitle = 'Thông tin',
  children,
  footer,
  size = 'lg',
}: BaseModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      centered
      radius="md"
      padding={0}
      withCloseButton={false}
    >
      <Box p="lg" pb={0} style={{ position: 'relative' }}>
        <Flex direction="column" gap={4}>
          {title && (
            <Text size="32px" fw={600} lh="1.2">
              {title}
            </Text>
          )}
          <Text
            fw={500}
            mt={10}
            style={{
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '17px',
              lineHeight: '100%',
              letterSpacing: '0.1px',
            }}
          >
            {subtitle}
          </Text>
        </Flex>

        <ActionIcon
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'transparent',
            color: 'black',
          }}
        >
          <IconX size={20} />
        </ActionIcon>
      </Box>

      <Box
        mah="70vh"
        mih="200px"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem',
          paddingTop: '0.5rem',
          paddingBottom: footer ? '1rem' : '1.5rem',
        }}
      >
        {children}
      </Box>

      {footer && (
        <Box p="lg" pt={0}>
          <Group justify="flex-end">{footer}</Group>
        </Box>
      )}
    </Modal>
  );
}
