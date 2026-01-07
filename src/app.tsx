import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { useKeycloak } from '@react-keycloak/web';

import { ConfirmModal } from './components/common/common-confirm-modal';
import { GlobalLoading } from './components/common/common-global-loading';
import { PersistProvider } from './components/providers/persist-provider';
import { DISABLE_AUTH } from './lib/utils';
import { routeTree } from './routeTree.gen';
import type { AuthContext } from './types/auth.type';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      gcTime: 5 * 60 * 1000,
      staleTime: 0,
    },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient,
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  // const { keycloak } = useKeycloak();

  // const auth: AuthContext = {
  //   isLoggedIn: keycloak.authenticated ?? false,
  //   tokenPayload: keycloak.tokenParsed,
  //   accessToken: keycloak.token,
  //   refreshToken: keycloak.refreshToken,
  //   logout: () => keycloak.logout(),
  // };

  // Sau có tk đăng nhập hrm thì mở cmt trên và xóa đoạn dưới này đi

  let auth: AuthContext;

  if (DISABLE_AUTH) {
    auth = {
      isLoggedIn: true,
      tokenPayload: undefined,
      accessToken: undefined,
      refreshToken: undefined,
      logout: () => {},
    };
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { keycloak } = useKeycloak();

    auth = {
      isLoggedIn: keycloak.authenticated ?? false,
      tokenPayload: keycloak.tokenParsed,
      accessToken: keycloak.token,
      refreshToken: keycloak.refreshToken,
      logout: () => keycloak.logout(),
    };
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PersistProvider>
        <GlobalLoading />
        <RouterProvider router={router} context={{ queryClient, auth }} />
        <ConfirmModal />
      </PersistProvider>
    </QueryClientProvider>
  );
}
