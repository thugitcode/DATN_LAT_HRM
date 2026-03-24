import { queryOptions } from '@tanstack/react-query';

import type { OtherRequestsManagementParams } from '@/features/other-requests-management/types/type';
import { payrollByMonthService } from '@/services/payroll-management/payroll-by-month.service';

export const payrollCalculationKeys = {
    all: ['payroll-calculation'] as const,
    lists: () => [...payrollCalculationKeys.all, 'list'] as const,
    list: (params?: OtherRequestsManagementParams) =>
        [...payrollCalculationKeys.lists(), params] as const,
    details: () => [...payrollCalculationKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...payrollCalculationKeys.details(), id] as const,
} as const;

export const payrollCalculationOptions = {
    list: (params?: OtherRequestsManagementParams) =>
        queryOptions({
            queryKey: payrollCalculationKeys.list(params),
            queryFn: () => payrollByMonthService.getAll(params),
            // retry: (failureCount, error: any) => {
            //     if (error?.status === 404) return false;
            //     return failureCount < 3;
            // },
            meta: { silentError: true },
        }),
    detail: (id: string) =>
        queryOptions({
            queryKey: payrollCalculationKeys.detail(id),
            queryFn: () => payrollByMonthService.getById(id),
        }),
    resultDetails: (id: string) =>
        queryOptions({
            queryKey: payrollCalculationKeys.detail(id),
            queryFn: () => payrollByMonthService.getResultDetails(id),
        }),
} as const;
