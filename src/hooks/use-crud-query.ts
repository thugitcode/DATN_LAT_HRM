import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { BaseApiService } from '@/services/base-api.service';

import type { ApiResponse, PaginationParams } from '@/types';
export const QUERY_KEY = {
  CANDIDATE: "candidate"
}
export function createCrudHooks<
  T,
  TParams extends Partial<PaginationParams> = Record<string, unknown>,
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
>(queryKey: string[], service: BaseApiService<T, TCreate, TUpdate, TParams>) {
  function useList(
    params?: TParams,
    options?: Omit<UseQueryOptions<ApiResponse<T[]>, Error>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery<ApiResponse<T[]>, Error>({
      queryKey: [...queryKey, 'list', params],
      queryFn: () => service.getAll(params),
      ...options,
    });
  }

  function useDetail(
    id: string | number | undefined,
    options?: Omit<UseQueryOptions<ApiResponse<T>, Error>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery<ApiResponse<T>, Error>({
      queryKey: [...queryKey, 'detail', id],
      queryFn: () => service.getById(id!),
      enabled: !!id,
      ...options,
    });
  }

  function useCreate(options?: UseMutationOptions<ApiResponse<T>, Error, TCreate>) {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<T>, Error, TCreate>({
      ...options,
      mutationFn: (data) => service.create(data),
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries({ queryKey: [...queryKey, 'list'] });
        await options?.onSuccess?.(...args);
      },
    });
  }

  function useUpdate(
    options?: UseMutationOptions<ApiResponse<T>, Error, { id: string | number; data: TUpdate }>,
  ) {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<T>, Error, { id: string | number; data: TUpdate }>({
      ...options,
      mutationFn: ({ id, data }) => service.update(id, data),
      onSuccess: async (data, variables, ...rest) => {
        await queryClient.invalidateQueries({ queryKey: [...queryKey, 'list'] });
        await queryClient.invalidateQueries({ queryKey: [...queryKey, 'detail', variables.id] });
        await options?.onSuccess?.(data, variables, ...rest);
      },
    });
  }

  function useDelete(options?: UseMutationOptions<ApiResponse<void>, Error, string | number>) {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<void>, Error, string | number>({
      ...options,
      mutationFn: (id) => service.delete(id),
      onSuccess: async (data, variables, ...rest) => {
        await queryClient.invalidateQueries({ queryKey: [...queryKey, 'list'] });
        queryClient.removeQueries({ queryKey: [...queryKey, 'detail', variables] });
        await options?.onSuccess?.(data, variables, ...rest);
      },
    });
  }

  return {
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  };
}
