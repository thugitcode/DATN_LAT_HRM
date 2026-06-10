import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadService } from '../upload.service';

export const uploadKeys = {
  all: ['upload'] as const,
  signedUrls: () => [...uploadKeys.all, 'signed-url'] as const,
  signedUrl: (filePath: string, expiresIn?: number) => 
    [...uploadKeys.signedUrls(), { filePath, expiresIn }] as const,
} as const;

export const uploadQueryOptions = {
  // Query dùng để lấy Signed URL
  signedUrl: (filePath: string, expiresIn?: number) =>
    queryOptions({
      queryKey: uploadKeys.signedUrl(filePath, expiresIn),
      queryFn: () => uploadService.getSignedUrl(filePath, expiresIn),
      enabled: !!filePath, // Chỉ chạy khi có path
      staleTime: (expiresIn || 3600) * 1000 - 60000, // Refresh trước khi hết hạn 1 phút
    }),
};

// Hook helper cho các hành động Mutation
export const useUploadMutation = () => {
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: (file: File) => uploadService.upload(file),
  });

  const uploadMultipleFiles = useMutation({
    mutationFn: (files: File[]) => uploadService.uploadMultiple(files),
  });

  const deleteFile = useMutation({
    mutationFn: (url: string) => uploadService.delete(url),
    onSuccess: () => {
      // Invalidate các query liên quan nếu cần
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
    },
  });

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
  };
};