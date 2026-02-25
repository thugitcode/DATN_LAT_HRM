import { useCallback } from 'react';

import { icons } from '@/lib/icons';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';
import { MonthFilter } from '@/components/filters/month-filter';
import { SearchInput } from '@/components/filters/search-input';

import { KHOA_OPTIONS, PHONG_OPTIONS } from '../constants/data';
import type { ShiftFilterParams } from '../types/filters.type';

export const ShiftManagementFilter: React.FC = () => {
  const { filters, setFilter } = useQueryFilter<ShiftFilterParams>({
    replace: true,
  });

  const handleMonthChange = useCallback(
    (value: string) => {
      setFilter('month', value);
    },
    [setFilter],
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setFilter('search', value);
    },
    [setFilter],
  );

  const handleKhoaChange = useCallback(
    (value: string | undefined) => {
      setFilter('khoa', value);
    },
    [setFilter],
  );

  const handlePhongChange = useCallback(
    (value: string | undefined) => {
      setFilter('phong', value);
    },
    [setFilter],
  );

  return (
    <div className="flex items-center gap-3 justify-between">
      <MonthFilter value={filters.month} onChange={handleMonthChange} />

      <SearchInput value={filters.search} onChange={handleSearchChange} startIcon={icons.search} />

      <FilterSelect
        options={KHOA_OPTIONS}
        value={filters.khoa}
        onChange={handleKhoaChange}
        placeholder="Khoa"
      />

      <FilterSelect
        options={PHONG_OPTIONS}
        value={filters.phong}
        onChange={handlePhongChange}
        placeholder="Phòng"
      />
    </div>
  );
};
