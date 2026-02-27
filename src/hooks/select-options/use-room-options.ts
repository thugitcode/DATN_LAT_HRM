import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ApiResponse, FormSelectOptions } from '@/types';
import { hrmInstance } from '@/lib/axios';

interface Room {
    id: string;
    code: string;
    name: string;
}

export const useRoomOptions = (departmentIds?: string | string[]): {
    options: FormSelectOptions<Room>;
    isLoading: boolean;
    isError: boolean;
    disabled: boolean;
} => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['rooms', departmentIds],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            queryParams.append('getAll', 'true');

            if (departmentIds) {
                if (Array.isArray(departmentIds)) {
                    departmentIds.forEach((id) => queryParams.append('departmentIds', id));
                } else {
                    queryParams.append('departmentId', departmentIds);
                }
            }

            const res = await hrmInstance.get<ApiResponse<Room[]>>(
                `/room?${queryParams.toString()}`
            );
            return res.data.data;
        },
        enabled: true,
    });

    const options: FormSelectOptions<Room> = useMemo(() => {
        if (!data) return [];
        return data.map((room) => ({
            value: room.id,
            label: room.name,
            item: room,
        }));
    }, [data]);

    return {
        options,
        isLoading,
        isError,
        disabled: isLoading || isError,
    };
};
