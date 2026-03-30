import { queryOptions } from '@tanstack/react-query';

import { taxService } from '@/services/tax/tax.service';

export const taxKeys = {
    all: ['tax'] as const,

    taxRate: () => [...taxKeys.all, 'tax-rate'] as const,
    taxBracket: () => [...taxKeys.all, 'tax-bracket'] as const,
} as const;

export const taxOptions = {
    getTaxRate: () =>
        queryOptions({
            queryKey: taxKeys.taxRate(),
            queryFn: () => taxService.getTaxRate(),
        }),
    getTaxBracket: () =>
        queryOptions({
            queryKey: taxKeys.taxBracket(),
            queryFn: () => taxService.getTaxBracket(),
        }),
} as const;
