import { useCallback } from 'react';

import type { RequestsParams } from '@/types/global.type';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { MonthFilter } from '@/components/filters/month-filter';

export const SummaryFinalizeMonthFilter = () => {
  const { filters, setFilter } = useQueryFilter<RequestsParams>();

  const handleMonthChange = useCallback(
    (value: string) => {
      setFilter('month', value);
    },
    [setFilter],
  );

  return (
    <div className="w-full max-w-50">
      <MonthFilter value={filters.month} onChange={handleMonthChange} />
    </div>
  );
};
