import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSignedUrlQueryOptions } from '@/query-options/upload-file.option';

import { convertFileInfo } from '@/lib/utils';

/**
 * Hook to prefetch signed URLs for avatar images
 * Call this hook with an array of avatar URLs to prefetch them in the background
 * This improves perceived performance by loading URLs before they're needed
 */
export const usePrefetchAvatars = (avatarUrls: (string | null | undefined)[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const validUrls = avatarUrls.filter((url): url is string => !!url);

    validUrls.forEach((url) => {
      const file = convertFileInfo([{ key: url }])[0];
      if (!file?.FILE_URL) return;

      // Prefetch in the background
      queryClient.prefetchQuery(getSignedUrlQueryOptions(file.FILE_URL));
    });
  }, [avatarUrls, queryClient]);
};
