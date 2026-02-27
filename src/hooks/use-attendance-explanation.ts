import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiResponse, QueryOptionsListResponse } from '@/types';
import type {
  AttendanceExplanation,
  AttendanceExplanationFilters,
  AttendanceExplanationSummary,
} from '@/types/attendance-explanation.type';
import { hrmInstance } from '@/lib/axios';

// Query options for list
export const attendanceExplanationListQueryOptions = (params: {
  page: number;
  limit: number;
  filters: AttendanceExplanationFilters | Record<string, any>;
}) => {
  return queryOptions({
    queryKey: ['attendance-explanation', 'list', params],
    queryFn: async (): Promise<
      QueryOptionsListResponse<AttendanceExplanation, AttendanceExplanationSummary>
    > => {
      const { page, limit, filters } = params;
      const res = await hrmInstance.get<ApiResponse<AttendanceExplanation[]>>(
        '/attendance-explanation',
        {
          params: {
            page,
            limit,
            ...filters,
          },
        },
      );

      return {
        data: res.data.data,
        pagination: {
          total: res.data.pagination?.total || 0,
          page: res.data.pagination?.page || page,
          limit: res.data.pagination?.limit || limit,
        },
        meta: res.data.metadata as any,
      };
    },
  });
};

// Query options for single item
export const attendanceExplanationDetailQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['attendance-explanation', 'detail', id],
    queryFn: async () => {
      const res = await hrmInstance.get<ApiResponse<AttendanceExplanation>>(
        `/attendance-explanation/${id}`,
      );
      return res.data.data;
    },
    enabled: !!id,
  });
};

// Mutation for approving
export const useApproveAttendanceExplanation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hrComment }: { id: string; hrComment?: string }) => {
      const res = await hrmInstance.post<ApiResponse<boolean>>(
        `/attendance-explanation/${id}/approve`,
        { hrComment },
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance-explanation'],
      });
    },
  });
};

// Mutation for manager approving
export const useManagerApproveAttendanceExplanation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      managerConfirmation,
    }: {
      id: string;
      managerConfirmation?: string;
    }) => {
      const res = await hrmInstance.post<ApiResponse<boolean>>(
        `/attendance-explanation/${id}/manager-approve`,
        { managerConfirmation },
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance-explanation'],
      });
    },
  });
};

// Mutation for rejecting
export const useRejectAttendanceExplanation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await hrmInstance.post<ApiResponse<boolean>>(
        `/attendance-explanation/${id}/reject`,
        { reason },
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance-explanation'],
      });
    },
  });
};

// Mutation for bulk approve
export const useBulkApproveAttendanceExplanation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, hrComment }: { ids: string[]; hrComment?: string }) => {
      const res = await hrmInstance.post<ApiResponse<{ success: number; failed: number }>>(
        '/attendance-explanation/bulk-approve',
        {
          ids,
          hrComment,
        },
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance-explanation'],
      });
    },
  });
};
