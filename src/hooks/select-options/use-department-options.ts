import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ApiResponse, FormSelectOptions } from '@/types';
import { hrmInstance } from '@/lib/axios';
import { catalogTypes } from '@/lib/constants';

interface Department {
    id: string;
    code: string;
    name: string;
}

export const useDepartmentOptions = (): {
    options: FormSelectOptions<Department>;
    disabled: boolean;
} => {
    const { data, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const res = await hrmInstance.get<ApiResponse<Department[]>>(
                `/catalog/${catalogTypes.GENERAL.DEPARTMENT}`
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
        disabled: isLoading,
    };
};
