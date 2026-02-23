import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { HeroUIProvider, ToastProvider } from '@heroui/react';

import { MainDrawer } from './components/drawers/main-drawer';
import { PersistProvider } from './components/providers/persist-provider';
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes

      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,

      retry: (failureCount, error) => {
        if (error instanceof Error) {
          const message = error.message.toLowerCase();
          if (
            message.includes('unauthorized') ||
            message.includes('forbidden') ||
            message.includes('not found') ||
            message.includes('không có quyền') ||
            message.includes('đăng nhập')
          ) {
            return false;
          }
        }

        return failureCount < 3;
      },

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
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PersistProvider>
        {/* <GlobalLoading /> */}
        <HeroUIProvider className="h-full">
          <ToastProvider placement={'top-right'} />
          <RouterProvider router={router} />
        </HeroUIProvider>
        {/* <ConfirmModal /> */}
        <MainDrawer />
      </PersistProvider>
    </QueryClientProvider>
  );
}
