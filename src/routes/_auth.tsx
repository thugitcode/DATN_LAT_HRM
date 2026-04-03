import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context: { auth } }) => {
    if (auth?.isLoggedIn) {
      throw redirect({ to: '/admin/timekeeping-shift-scheduling' });
    }
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
