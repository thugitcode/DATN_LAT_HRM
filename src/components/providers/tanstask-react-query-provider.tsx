import type { FC, ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';

interface TanstaskReactQueryProviderProps {
  children: ReactNode;
}

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

export const TanstaskReactQueryProvider: FC<Readonly<TanstaskReactQueryProviderProps>> = ({
  children,
}) => {
  return <div>{children}</div>;
};
