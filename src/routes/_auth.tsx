import { createFileRoute, Outlet } from '@tanstack/react-router';
import { identityQueryOptions } from '@/query-options';

import { useBootstrapStaticData } from '@/hooks/common/use-bootstrap-static-data';
import { MainLayout } from '@/components/layouts/main-layout/main-layout';

export const Route = createFileRoute('/_auth')({
  // beforeLoad: ({ context: { auth } }) => {
  //   if (auth.isLoggedIn) {
  //     throw redirect({ to: '/admin' });
  //   }

  //   apiTokens.accessToken = undefined;
  //   apiTokens.refreshToken = undefined;
  // },

  // loader: async ({ context: { queryClient } }) => {
  //   await queryClient.ensureQueryData(identityQueryOptions());
  // },
  component: RouteComponent,
});

function RouteComponent() {
  // const { isBootstrapping } = useBootstrapStaticData();

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
