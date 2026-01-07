import { useRouter } from '@tanstack/react-router';
import { Box, Button, Divider, Group, LoadingOverlay, Stack, type StackProps } from '@mantine/core';

import { Form } from '../forms/form';
import { CommonContainer, type CommonContainerProps } from './common-container';
import { Space } from '@mantine/core';

export type CommonFormSectionProps = CommonContainerProps & {
  onSubmit?: () => void;
  footer?: {
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
    custom?: React.ReactNode;
  };
  isLoading?: boolean;
  mainProps?: StackProps;
  hideCancelButton?: boolean;
};

export const CommonFormSection = ({
  children,
  onSubmit,
  footer,
  isLoading,
  mainProps,
  hideCancelButton = false,
  ...props
}: CommonFormSectionProps) => {
  const router = useRouter();

  function handleGoBack() {
    router.history.back();
  }

  return (
    <CommonContainer
      p={0}
      pos="relative"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      {...props}
    >
      <Form
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          //   overflow: 'hidden',
        }}
        onSubmit={onSubmit}
      >
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Stack p="lg" style={{ minHeight: '100%' }} {...mainProps}>
            {/* <Form style={{ display: 'flex', flexDirection: 'column', flex: 1 }} onSubmit={onSubmit}> */}
              {children}
            {/* </Form> */}
          </Stack>
        </Box>

        {footer?.custom ? (
          footer.custom
        ) : (
          <Box bg="white" pos="sticky" bottom={0} style={{ zIndex: 3 }}>
            <Divider />
            <Group justify="space-between" px="md" py="sm" gap="sm">
              <Group gap="sm">{footer?.leading}</Group>
              <Group gap="sm">
                {!hideCancelButton && (
                  <Button variant="outline" onClick={handleGoBack}>
                    Hủy
                  </Button>
                )}
                {footer?.trailing}
              </Group>
            </Group>
          </Box>
        )}
      </Form>

      <LoadingOverlay visible={isLoading ?? false} />
    </CommonContainer>
  );
};
