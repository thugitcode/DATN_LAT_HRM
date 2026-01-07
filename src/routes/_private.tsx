import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Center, Loader, LoadingOverlay, Stack, Text } from '@mantine/core';
import { identityQueryOptions } from '@/query-options';

import { apiTokens } from '@/lib/axios';

// import { useBootstrapStaticData } from '@/hooks/common/use-bootstrap-static-data';

export const Route = createFileRoute('/_private')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isLoggedIn) {
      throw redirect({ to: '/login' });
    }
    apiTokens.accessToken = auth.accessToken;
    apiTokens.refreshToken = auth.refreshToken;
  },
  loader: async ({ context: { queryClient } }) => {
    // await queryClient.ensureQueryData(identityQueryOptions());
  },
  pendingComponent: PendingComponent,
  component: RouteComponent,
});

function PendingComponent() {
  return (
    <Center h="100vh">
      <Loader size="lg" />
    </Center>
  );
}

function RouteComponent() {
  // Bootstrap dữ liệu tĩnh sau khi login
  // const { isBootstrapping } = useBootstrapStaticData();

  return (
    <>
      <Outlet />

      <LoadingOverlay
        // visible={isBootstrapping}
        visible={false}
        // zIndex={500}
        loaderProps={{
          children: (
            <Stack align="center">
              <Loader />
              <Text>Đang khởi tạo dữ liệu...</Text>
            </Stack>
          ),
        }}
      />
    </>
  );
}
