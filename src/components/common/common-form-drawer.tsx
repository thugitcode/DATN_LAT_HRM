import {
  Box,
  Divider,
  Drawer,
  Flex,
  Group,
  LoadingOverlay,
  Title,
  type BoxProps,
  type ModalBaseProps,
} from '@mantine/core';

import { Form } from '../forms/form';

export type CommonFormDrawerProps = React.PropsWithChildren<{
  title: string;
  opened: boolean;
  onClose: () => void;
  onSubmit: () => void;
  footer?: React.ReactNode;
  size?: ModalBaseProps['size'];
  isLoading?: boolean;
  bodyProps?: BoxProps;
  footerProps?: BoxProps;
}>;

export const CommonFormDrawer = ({
  children,
  title,
  opened,
  onClose,
  onSubmit,
  footer,
  size,
  isLoading,
  bodyProps,
  footerProps,
}: CommonFormDrawerProps) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={null}
      position="right"
      size={size}
      trapFocus={false}
      withCloseButton={false}
      zIndex={200}
      styles={{
        content: {
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          flex: 1,
          padding: 0,
        },
      }}
    >
      <Form onSubmit={onSubmit}>
        <Flex direction="column" h="100dvh" pos="relative" style={{ overflow: 'hidden' }}>
          <LoadingOverlay visible={isLoading} />

          <Box>
            <Group gap="xs" px="md" py="sm">
              <Title order={3}>{title}</Title>
            </Group>

            <Divider />
          </Box>

          <Box
            flex={1}
            {...bodyProps}
            style={{
              overflow: 'auto',
              ...bodyProps?.style,
            }}
          >
            {children}
          </Box>

          {footer && (
            <Box bg="white" pos="sticky" bottom={0} {...footerProps}>
              <Divider />

              <Group justify="end" gap="xs" px="md" py="sm">
                {footer}
              </Group>
            </Box>
          )}
        </Flex>
      </Form>
    </Drawer>
  );
};
