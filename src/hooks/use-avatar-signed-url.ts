import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSignedUrlQueryOptions } from '@/query-options/upload-file.option';

import { STATUS_CODE } from '@/lib/constants';
import { convertFileInfo } from '@/lib/utils';

interface UseAvatarSignedUrlOptions {
  enabled?: boolean;
}

/**
 * Hook to get and cache signed URL for avatar images
 * Uses React Query to cache URLs and prevent redundant API calls
 * Cached URLs are valid for 1 hour (as per API expiresIn: 3600)
 */
export const useAvatarSignedUrl = (
  fileUrl: string | null | undefined,
  options?: UseAvatarSignedUrlOptions,
) => {
  const queryClient = useQueryClient();
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['avatar-signed-url', fileUrl],
    queryFn: async (): Promise<string> => {
      if (!fileUrl) return '';

      const file = convertFileInfo([{ key: fileUrl }])[0];
      if (!file?.FILE_URL) return '';

      try {
        const res = await queryClient.fetchQuery(getSignedUrlQueryOptions(file.FILE_URL));

        if (res?.status?.toString()?.startsWith(STATUS_CODE.SUCCESS)) {
          return res.data ?? '';
        }
      } catch (error) {
        console.error('Failed to fetch signed URL for avatar:', error);
      }

      return '';
    },
    enabled: enabled && !!fileUrl,
    staleTime: 1000 * 60 * 50, // 50 minutes (URL expires in 60 minutes)
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 1,
    retryDelay: 1000,
  });
};
