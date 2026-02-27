import { useMemo } from 'react';
import dayjs from 'dayjs';

export const useMonthDateRange = (monthStr?: string | null) => {
  return useMemo(() => {
    const month = dayjs(monthStr ?? dayjs().format('YYYY-MM'), 'YYYY-MM');
    return {
      startDate: month.startOf('month').format('YYYY-MM-DD'),
      endDate: month.endOf('month').format('YYYY-MM-DD'),
    };
  }, [monthStr]);
};
