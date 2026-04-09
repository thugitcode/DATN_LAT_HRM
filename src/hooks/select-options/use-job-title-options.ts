import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ApiResponse, FormSelectOptions } from '@/types';
import { hrmInstance } from '@/lib/axios';

export interface JobTitle {
  id: string;
  name: string;
}

export const useJobTitleOptions = (): {
  options: FormSelectOptions<JobTitle>;
  isLoading: boolean;
  isError: boolean;
  disabled: boolean;
} => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      const res = await hrmInstance.get<ApiResponse<JobTitle[]>>('/job-title', {
        params: { getAll: true },
      });
      return res.data.data;
    },
  });

  const options: FormSelectOptions<JobTitle> = useMemo(() => {
    if (!data) return [];
    return data.map((jt) => ({
      value: jt.id,
      label: jt.name,
      item: jt,
    }));
  }, [data]);

  return {
    options,
    isLoading,
    isError,
    disabled: isLoading || isError,
  };
};
