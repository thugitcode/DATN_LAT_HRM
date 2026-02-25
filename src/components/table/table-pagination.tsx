import type { FC } from 'react';
import { Pagination, Select, SelectItem } from '@heroui/react';

import { useQueryFilter } from '@/hooks/useQueryFilter';

interface TablePaginationProps {}

interface PaginationFilters extends Record<string, unknown> {
  total?: string;
  limit?: string;
  page?: string;
}

const LIMIT_OPTIONS = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
  { label: '100', value: '100' },
];

export const TablePagination: FC<Readonly<TablePaginationProps>> = () => {
  const { filters, setFilter, setFilters } = useQueryFilter<PaginationFilters>();

  const total = filters.total ? Number(filters.total) : 0;
  const limit = filters.limit ? Number(filters.limit) : 10;
  const page = filters.page ? Number(filters.page) : 1;

  const totalPages = Math.ceil(total / limit) || 1;

  const handlePageChange = (newPage: number) => {
    setFilters({ page: String(newPage) });
  };

  const handleLimitChange = (value: string) => {
    setFilters({ limit: value, page: '1' });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-default-600">
        <span>Rows per page:</span>
        <Select
          size="sm"
          className="w-20"
          selectedKeys={[String(limit)]}
          onChange={(e) => handleLimitChange(e.target.value)}
          aria-label="Rows per page"
        >
          {LIMIT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
        <span>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>
      </div>

      <Pagination
        isCompact
        showControls
        page={page}
        total={totalPages}
        onChange={handlePageChange}
      />
    </div>
  );
};
