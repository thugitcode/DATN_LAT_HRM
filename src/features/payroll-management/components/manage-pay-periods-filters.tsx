import { useCallback } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';
import { SearchInput } from '@/components/filters/search-input';
import { YearFilter } from '@/components/year-filter';

export const ManagePayPeriodsFilters = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { filters, setFilter } = useQueryFilter<RequestsParams>();

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setFilter('search', value);
    },
    [setFilter],
  );

  const handleStatusChange = useCallback(
    (value: string | undefined) => {
      setFilter('status', value);
    },
    [setFilter],
  );

  const handleYearChange = useCallback(
    (value: string) => {
      setFilter('year', value);
    },
    [setFilter],
  );

  return (
    <div className="flex items-center gap-3 justify-between">
      <YearFilter value={filters.year} onChange={handleYearChange} />

      <SearchInput value={filters.search} onChange={handleSearchChange} startIcon={icons.search} />

      <div className="w-120">
        <FilterSelect
          options={[]}
          value={filters.status as string}
          onChange={handleStatusChange}
          placeholder={t('actions.status')}
        />
      </div>
    </div>
  );
};
