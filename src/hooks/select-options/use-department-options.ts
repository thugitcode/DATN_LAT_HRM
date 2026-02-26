import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ApiResponse, FormSelectOptions } from '@/types';
import { hrmInstance } from '@/lib/axios';

interface Department {
    id: string;
    code: string;
    name: string;
}

export const useDepartmentOptions = (): {
    options: FormSelectOptions<Department>;
    isLoading: boolean;
    isError: boolean;
    disabled: boolean;
} => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const res = await hrmInstance.get<ApiResponse<Department[]>>(
                '/department',
                { params: { getAll: true } },
            );
            return res.data.data;
        },
    });

    const options: FormSelectOptions<Department> = useMemo(() => {
        if (!data) return [];
        return data.map((dept) => ({
            value: dept.id,
            label: dept.name,
            item: dept,
        }));
    }, [data]);

    return {
        options,
        isLoading,
        isError,
        disabled: isLoading || isError,
    };
};
