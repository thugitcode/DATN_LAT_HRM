import { queryOptions } from '@tanstack/react-query';
import { allowanceService } from '../allowance.service';
import type { PaginationParams } from '@/types';
import type { AllowanceType } from '@/types/allowance.type';

export const allowanceKeys = {
    all: ['allowance'] as const,
    lists: () => [...allowanceKeys.all, 'list'] as const,
    list: (params?: PaginationParams & { type?: AllowanceType }) => [...allowanceKeys.lists(), params] as const,
    details: () => [...allowanceKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...allowanceKeys.details(), id] as const,
} as const;

export const allowanceQueryOptions = {
    list: (params?: PaginationParams & { type?: AllowanceType }) => {
        const newParams = { ...params };
        if (params?.type) {
            newParams.type = params.type;
        } else {
            delete newParams.type;
        }
        return queryOptions({
            queryKey: allowanceKeys.list(newParams),
            queryFn: () => allowanceService.getAll(newParams),
        })
    },

    detail: (id: string | number) =>
        queryOptions({
            queryKey: allowanceKeys.detail(id),
            queryFn: () => allowanceService.getById(id),
            enabled: !!id,
        }),
} as const;
