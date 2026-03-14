import { useMemo } from 'react';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';

interface PaginationConfigProps {
  page?: string | number;
  limit?: string | number;
  total?: number;
  totalPage?: number;
}

export const usePaginationConfig = ({
  page = 1,
  limit = 10,
  total,
  totalPage,
}: PaginationConfigProps) => {
  const paginationConfig = useMemo(() => {
    const current = Number(page);
    const pageSize = Number(limit);

    return {
      current,
      pageSize,
      total: total ?? 0,
      totalPage: totalPage ?? 0,
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
    };
  }, [page, limit, total, totalPage]);

  return { paginationConfig };
};
