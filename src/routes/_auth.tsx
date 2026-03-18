import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { apiTokens } from '@/lib/axios';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context: { auth } }) => {
    // if (auth.isLoggedIn) {
    //   throw redirect({ to: '/admin' });
    // }
    // apiTokens.accessToken = undefined;
    // apiTokens.refreshToken = undefined;
  },

  // loader: async ({ context: { queryClient } }) => {
  //   await queryClient.ensureQueryData(identityQueryOptions());
  // },
  component: RouteComponent,
});

function RouteComponent() {
  // const { isBootstrapping } = useBootstrapStaticData();

  return (
    <>
      <Outlet />
    </>
  );
}
