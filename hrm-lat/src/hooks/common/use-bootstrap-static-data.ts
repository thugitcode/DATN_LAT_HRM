import { useEffect, useRef, useState } from 'react';
import { dehydrate, useQueryClient } from '@tanstack/react-query';

import { BOOTSTRAP_BATCH_SIZE } from '@/lib/constants';
import { idbPersister } from '@/lib/idb-persister';
import { logger } from '@/lib/logger';
import { isPersistableQuery } from '@/lib/utils';
import { useIdentity } from '@/hooks/common/use-identity';

// Global flag để tránh bootstrap nhiều lần (persist qua remounts)
let isBootstrappedGlobal = false;

/**
 * Hook để bootstrap (prefetch) dữ liệu tĩnh sau khi login
 * Chỉ chạy khi user đã authenticated
 */
export function useBootstrapStaticData() {
  const queryClient = useQueryClient();
  const { identity } = useIdentity();
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const bootstrapAttemptedRef = useRef(false);

  useEffect(() => {
    // Chỉ bootstrap khi:
    // 1. User đã authenticated
    // 2. Chưa bootstrap lần nào (global flag)
    // 3. Chưa attempt trong component này (ref)
    if (isBootstrappedGlobal || bootstrapAttemptedRef.current) {
      return;
    }

    // Đánh dấu đã attempt (tránh chạy 2 lần trong cùng component instance)
    bootstrapAttemptedRef.current = true;

    // Bootstrap các dữ liệu tĩnh nếu chưa có trong cache
    const bootstrapData = async () => {
      const startTime = performance.now();
      let fetchedCount = 0;
      let cachedCount = 0;

      try {
        logger.log('🚀 Starting bootstrap static data...');
        setIsBootstrapping(true);

        // Danh sách query options cần prefetch
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryOptions: any[] = [];

        // Prefetch theo batch để tránh overload server
        for (let i = 0; i < queryOptions.length; i += BOOTSTRAP_BATCH_SIZE) {
          const batch = queryOptions.slice(i, i + BOOTSTRAP_BATCH_SIZE);

          await Promise.all(
            batch.map(async (option) => {
              const existingData = queryClient.getQueryData(option.queryKey);
              logger.log(`  🔍 Checking ${option.queryKey[0]} - queryKey:`, option.queryKey);
              logger.log(`     existingData:`, existingData ? 'EXISTS' : 'NULL');

              // Debug: Kiểm tra tất cả queries trong cache
              const allQueries = queryClient.getQueryCache().getAll();
              const matchingQueries = allQueries.filter(
                (q) => q.queryKey[0] === option.queryKey[0],
              );
              logger.log(`     matching queries in cache:`, matchingQueries.length);
              matchingQueries.forEach((q) => {
                logger.log(`       - queryKey:`, q.queryKey, `hasData:`, !!q.state.data);
              });

              if (!existingData) {
                try {
                  const queryStartTime = performance.now();
                  // // @ts-expect-error - Type mismatch giữa queryOptions và prefetchQuery, safe to ignore
                  await queryClient.prefetchQuery(option);
                  const queryEndTime = performance.now();
                  logger.log(
                    `  ✓ Fetched ${option.queryKey[0]} in ${(queryEndTime - queryStartTime).toFixed(2)}ms`,
                  );
                  fetchedCount++;
                } catch (error) {
                  console.error(`  ✗ Failed to prefetch ${option.queryKey[0]}:`, error);
                }
              } else {
                logger.log(`  ⚡ Cached ${option.queryKey[0]} (skip)`);
                cachedCount++;
              }
            }),
          );
        }

        const endTime = performance.now();
        logger.log(`✅ Bootstrap completed in ${(endTime - startTime).toFixed(2)}ms`);
        logger.log(`   - Fetched: ${fetchedCount}, Cached: ${cachedCount}`);

        // Đánh dấu global đã bootstrap
        isBootstrappedGlobal = true;

        // Persist static data NGAY sau bootstrap
        // Đảm bảo không mất data nếu user đóng tab sớm
        if (fetchedCount > 0) {
          logger.log('💾 Persisting bootstrap data...');
          const dehydratedState = dehydrate(queryClient, {
            shouldDehydrateQuery: isPersistableQuery,
            shouldDehydrateMutation: () => false,
          });

          idbPersister.persistClient({
            buster: '',
            clientState: dehydratedState,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('❌ Failed to bootstrap static data:', error);
        // Reset nếu lỗi để có thể retry
        bootstrapAttemptedRef.current = false;
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapData();
  }, [identity, queryClient]);

  return {
    isBootstrapping,
  };
}
