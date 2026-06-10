import type { RequestsParams } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { usePaginationConfig } from '@/hooks/use-pagination-config';
import { useQueryFilter } from '@/hooks/useQueryFilter';

type FetchParams = {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  departmentId?: string;
  roomId?: string;
};

type FetchResult<TData> = {
  data: { data: TData[]; pagination: { total: number; totalPage: number } } | undefined;
  isLoading: boolean;
};

interface UsePayrollDataPageOptions<TData> {
  fetchFn: (params: FetchParams) => FetchResult<TData>;
}

export const useDataSummaryPage = <TData>({ fetchFn }: UsePayrollDataPageOptions<TData>) => {
  const { filters, clearFilters } = useQueryFilter<RequestsParams>();
  const { departmentId, month, roomId, search, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);

  const { data, isLoading } = fetchFn({
    page: page ?? 1,
    limit: limit ?? 10,
    startDate,
    endDate,
    search,
    departmentId,
    roomId,
  });

  const { paginationConfig } = usePaginationConfig({
    page,
    limit,
    total: data?.pagination?.total,
    totalPage: data?.pagination?.totalPage,
  });

  return {
    data: data?.data ?? [],
    paginationConfig,
    isLoading,
    clearFilters,
  };
};
