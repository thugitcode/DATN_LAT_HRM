import { useEffect } from 'react';
import { dehydrate, hydrate, useQueryClient } from '@tanstack/react-query';

import { PERSIST_MAX_AGE, STATIC_DATA_STALE_TIME } from '@/lib/constants';
import { idbPersister } from '@/lib/idb-persister';
import { logger } from '@/lib/logger';
import { isPersistableQuery } from '@/lib/utils';

/**
 * Hook để restore cache từ IndexedDB khi app start
 * và persist cache khi user đóng tab (beforeunload)
 *
 * KHÔNG subscribe to query updates vì `dehydrate()` block UI!
 */
export function usePersistStaticData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let isSubscribed = true;

    const restoreCache = async () => {
      try {
        const persistedClient = await idbPersister.restoreClient();
        if (!persistedClient || !isSubscribed) return;

        // Validate cache age
        const now = Date.now();
        const isExpired =
          persistedClient.timestamp && now - persistedClient.timestamp > PERSIST_MAX_AGE;

        if (isExpired) {
          logger.log('⏰ Persisted cache expired, clearing...');
          await idbPersister.removeClient();
          return;
        }

        // Hydrate cache
        hydrate(queryClient, persistedClient.clientState);
        logger.log('✅ Cache restored and hydrated');

        // Log chi tiết từng query được restore
        persistedClient.clientState.queries?.forEach((query) => {
          const queryKey = query.queryKey[0];
          const dataAge = Date.now() - (query.state.dataUpdatedAt || 0);
          const isStale = dataAge > STATIC_DATA_STALE_TIME;
          logger.log(`   - ${queryKey}: age=${(dataAge / 1000).toFixed(0)}s, stale=${isStale}`);
        });
      } catch (error) {
        console.error('Failed to restore cache:', error);
      }
    };

    restoreCache();

    // Persist khi user đóng tab/navigate away
    const handleBeforeUnload = () => {
      const dehydratedState = dehydrate(queryClient, {
        shouldDehydrateQuery: isPersistableQuery,
        shouldDehydrateMutation: () => false,
      });

      idbPersister.persistClient({
        buster: '',
        clientState: dehydratedState,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isSubscribed = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [queryClient]);
}
