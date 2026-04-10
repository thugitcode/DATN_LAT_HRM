import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { AxiosError } from 'axios';

import type { AuthContext } from '@/types/auth.type';
import { CommonErrorComponent } from '@/components/common-error-component';
import { MainConfirmModal } from '@/components/confirm-modal/main-confirm-modal';
import { MainDrawer } from '@/components/drawers/main-drawer';
import { MainModal } from '@/components/modals/main-modal';
import ModalViewFile from '@/components/modal-view-file';

import i18n from '../i18n';

// import { CommonErrorComponent } from '@/components/common/common-error-component';
// import { CommonNotFoundComponent } from '@/components/common/common-not-found-component';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContext;
}>()({
  component: RootComponent,
  notFoundComponent: () => <div>Not found</div>,
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

    return <CommonErrorComponent isUnauthenticated={isUnauthenticated} />;

    // return <div>Bố m ở root</div>;
  },
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <MainDrawer />
      <MainModal />
      <MainConfirmModal />
      <ModalViewFile />
      {/* <TanStackDevtools
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
      /> */}
    </>
  );
}
