import { queryOptions } from '@tanstack/react-query';
import { shiftTemplateService } from '@/services/shift-template.service';
import type { ShiftTemplateParams } from '@/types/shift-template.type';

export const shiftTemplateKeys = {
    all: ['shift-template'] as const,
    lists: () => [...shiftTemplateKeys.all, 'list'] as const,
    list: (params?: ShiftTemplateParams) => [...shiftTemplateKeys.lists(), params] as const,
    details: () => [...shiftTemplateKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...shiftTemplateKeys.details(), id] as const,
} as const;

export const shiftTemplateQueryOptions = {
    list: (params?: ShiftTemplateParams) =>
        queryOptions({
            queryKey: shiftTemplateKeys.list(params),
            queryFn: () => shiftTemplateService.getAll(params),
        }),

    detail: (id: string | number) =>
        queryOptions({
            queryKey: shiftTemplateKeys.detail(id),
            queryFn: () => shiftTemplateService.getById(id),
            enabled: !!id,
        }),
} as const;
