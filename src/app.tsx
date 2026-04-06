import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { addToast, HeroUIProvider, ToastProvider } from '@heroui/react';
import { useKeycloak } from '@react-keycloak/web';

import { PersistProvider } from './components/providers/persist-provider';
import { routeTree } from './routeTree.gen';
import i18n from './i18n';
import type { AuthContext } from './types/auth.type';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silentError) return;
      addToast({
        title: i18n.t('common:toast.description.error_generic'),
        description: error.message,
        color: 'danger',
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes

      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,

      // Đéo cần cái này
      // retry: (failureCount, error) => {
      //   if (error instanceof Error) {
      //     const message = error.message.toLowerCase();
      //     if (
      //       message.includes('unauthorized') ||
      //       message.includes('forbidden') ||
      //       message.includes('not found') ||
      //       message.includes('không có quyền') ||
      //       message.includes('đăng nhập')
      //     ) {
      //       return false;
      //     }
      //   }

      //   return failureCount < 3;
      // },

      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      networkMode: 'online',
    },

    mutations: {
      retry: 1,

      networkMode: 'online',

      onError: (error) => {
        console.error('Mutation error:', error);
      },
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

  stringifySearch: (search) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }
    const str = params.toString();
    return str ? `?${str}` : '';
  },
  parseSearch: (search) => {
    return Object.fromEntries(new URLSearchParams(search).entries());
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const { keycloak } = useKeycloak();
  const auth: AuthContext = {
    isLoggedIn: keycloak.authenticated ?? false,
    tokenPayload: keycloak.tokenParsed,
    accessToken: keycloak.token,
    refreshToken: keycloak.refreshToken,
    logout: () => keycloak.logout(),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider placement={'top-right'} />
      <PersistProvider>
        <HeroUIProvider className="h-full">
          <RouterProvider router={router} context={{ queryClient, auth }} />
        </HeroUIProvider>
      </PersistProvider>
    </QueryClientProvider>
  );
}
