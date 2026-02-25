import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ApiResponse, FormSelectOptions } from '@/types';
import { hrmInstance } from '@/lib/axios';
import { catalogTypes } from '@/lib/constants';

interface Room {
    id: string;
    code: string;
    name: string;
}

export const useRoomOptions = (departmentId?: string): {
    options: FormSelectOptions<Room>;
    disabled: boolean;
} => {
    const { data, isLoading } = useQuery({
        queryKey: ['rooms', departmentId],
        queryFn: async () => {
            const params = departmentId ? { departmentId } : {};
            const res = await hrmInstance.get<ApiResponse<Room[]>>(
                `/catalog/${catalogTypes.GENERAL.ROOM}`,
                { params }
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
        disabled: isLoading,
    };
};
