import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { clinic40Api } from '@/lib/axios';
import type { ApiResponse, QueryOptionsListResponse } from '@/types';
import type {
    AttendanceExplanation,
    AttendanceExplanationFilters,
    AttendanceExplanationSummary,
} from '@/types/attendance-explanation.type';

// Query options for list
export const attendanceExplanationListQueryOptions = (params: {
    page: number;
    limit: number;
    filters: AttendanceExplanationFilters;
}) => {
    return queryOptions({
        queryKey: ['attendance-explanation', 'list', params],
        queryFn: async (): Promise<QueryOptionsListResponse<AttendanceExplanation, AttendanceExplanationSummary>> => {
            const { page, limit, filters } = params;
            const res = await clinic40Api.get<ApiResponse<AttendanceExplanation[]>>(
                '/attendance-explanation',
                {
                    params: {
                        page,
                        limit,
                        // ...filters,
                    },
                }
            );

            return {
                data: res.data.data,
                pagination: {
                    total: (res.data as any).total || 0,
                    page: (res.data as any).page || page,
                    limit: (res.data as any).limit || limit,
                },
                meta: (res.data as any).metadata,
            };
        },
    });
};

// Query options for single item
export const attendanceExplanationDetailQueryOptions = (id: string) => {
    return queryOptions({
        queryKey: ['attendance-explanation', 'detail', id],
        queryFn: async () => {
            const res = await clinic40Api.get<ApiResponse<AttendanceExplanation>>(
                `/attendance-explanation/${id}`
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
        mutationFn: async ({
            id,
            hrComment,
        }: {
            id: string;
            hrComment?: string;
        }) => {
            const res = await clinic40Api.post<ApiResponse<boolean>>(
                `/attendance-explanation/${id}/approve`,
                { hrComment }
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
        mutationFn: async ({
            id,
            reason,
        }: {
            id: string;
            reason: string;
        }) => {
            const res = await clinic40Api.post<ApiResponse<boolean>>(
                `/attendance-explanation/${id}/reject`,
                { reason }
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
        mutationFn: async ({
            ids,
            hrComment,
        }: {
            ids: string[];
            hrComment?: string;
        }) => {
            const res = await clinic40Api.post<
                ApiResponse<{ success: number; failed: number }>
            >('/attendance-explanation/bulk-approve', {
                ids,
                hrComment,
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['attendance-explanation'],
            });
        },
    });
};
