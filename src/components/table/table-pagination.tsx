import type { FC } from 'react';
import { Pagination, Select, SelectItem } from '@heroui/react';

import { useQueryFilter } from '@/hooks/useQueryFilter';

interface PaginationFilters extends Record<string, unknown> {
  limit?: string;
  page?: string;
}

interface TablePaginationProps {
  total?: number;
  limitOptions?: { label: string; value: string }[];
}

const LIMIT_OPTIONS = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
  { label: '100', value: '100' },
] as const;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = '10';

export const TablePagination: FC<Readonly<TablePaginationProps>> = ({ total = 0, limitOptions = LIMIT_OPTIONS }) => {
  const { filters, setFilter, setFilters } = useQueryFilter<PaginationFilters>();

  const page = Number(filters.page) || DEFAULT_PAGE;
  const limit = Number(filters.limit) || Number(DEFAULT_LIMIT);

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ limit: e.target.value, page: String(DEFAULT_PAGE) });
  };

  const handlePageChange = (newPage: number) => {
    setFilter('page', String(newPage));
  };

  const totalText = total > 0 ? `Page ${page} of ${total}` : 'No data';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-default-600">
        <span>Page:</span>
        <Select
          size="sm"
          className="w-20"
          selectedKeys={[String(limit)]}
          onChange={handleLimitChange}
          aria-label="Rows per page"
          classNames={{
            trigger: 'bg-white',
          }}
        >
          {limitOptions.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
        <span>{totalText}</span>
      </div>

      {total > 0 && (
        <Pagination
          isCompact
          showControls
          page={page}
          total={total}
          onChange={handlePageChange}
          classNames={{
            item: 'bg-white',
            prev: 'bg-white',
            next: 'bg-white',
          }}
        />
      )}
    </div>
  );
};
