import { useMemo } from 'react';
import dayjs from 'dayjs';

import { useQueryFilter } from '@/hooks/useQueryFilter';

export const useYearMonth = () => {
  const { filters } = useQueryFilter({ replace: false });

  const { year, month } = useMemo(() => {
    const monthStr =
      typeof filters.month === 'string' && filters.month
        ? filters.month
        : dayjs().format('YYYY-MM');

    const monthDate = dayjs(monthStr, 'YYYY-MM');

    return {
      year: monthDate.year(),
      month: monthDate.month(),
    };
  }, [filters.month]);

  return { year, month };
};
