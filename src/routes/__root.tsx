import { TanStackDevtools } from '@tanstack/react-devtools';
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { AxiosError } from 'axios';

import type { AuthContext } from '@/types/auth.type';
// import { CommonErrorComponent } from '@/components/common/common-error-component';
import { CommonNotFoundComponent } from '@/components/common/common-not-found-component';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContext;
}>()({
  component: RootComponent,
  notFoundComponent: () => <CommonNotFoundComponent variant="page" h="100dvh" />,
  errorComponent: ({ error }) => {
    let isUnauthenticated = false;
    let isUnauthorized = false;

    if (
      (error instanceof AxiosError && error.status === 401) ||
      error.message.includes('Invalid token')
    ) {
      isUnauthenticated = true;
    }

    if (error instanceof AxiosError && error.status === 403) {
      isUnauthorized = true;
    }

    return (
      // <CommonErrorComponent
      //   isUnauthenticated={isUnauthenticated}
      //   isUnauthorized={isUnauthorized}
      //   h="100dvh"
      // />

      <div>CommonErrorComponent</div>
    );
  },
});

function RootComponent() {
  return (
    <>
      <Outlet />

      <TanStackDevtools
        plugins={[
          {
            name: 'TanStack Query',
            render: <ReactQueryDevtoolsPanel />,
            defaultOpen: true,
          },
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: 'TanStack Form',
            render: <FormDevtoolsPanel />,
          },
        ]}
        config={{
          defaultOpen: false,
          position: 'bottom-left',
        }}
      />
    </>
  );
}
