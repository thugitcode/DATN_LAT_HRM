import { useCallback, type FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ShiftManagementParams } from '@/types';
import type { Options } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';
import { MonthFilter } from '@/components/filters/month-filter';
import { SearchInput } from '@/components/filters/search-input';

interface PayrollManagementFiltersProps {
  statusOptions?: Options[];
}

export const PayrollManagementFilters: FC<PayrollManagementFiltersProps> = ({
  statusOptions = [],
}) => {
  const { filters, setFilter } = useQueryFilter<ShiftManagementParams>();
  const { t } = useTranslation(NAMESPACES.COMMON);

  const { options: roomOptions } = useRoomOptions(filters?.departmentId);
  const { options: departmentOptions } = useDepartmentOptions();

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
      setFilter('departmentId', value);
    },
    [setFilter],
  );

  const handlePhongChange = useCallback(
    (value: string | undefined) => {
      setFilter('roomId', value);
    },
    [setFilter],
  );

  const handleStatusChange = useCallback(
    (value: string | undefined) => {
      setFilter('status', value);
    },
    [setFilter],
  );

  return (
    <div className="flex items-center gap-3 justify-between">
      <MonthFilter value={filters.month} onChange={handleMonthChange} />

      <SearchInput value={filters.search} onChange={handleSearchChange} startIcon={icons.search} />

      <FilterSelect
        options={departmentOptions}
        value={filters.departmentId as string}
        onChange={handleKhoaChange}
        placeholder={t('actions.department')}
      />

      <FilterSelect
        options={roomOptions}
        value={filters.roomId as string}
        onChange={handlePhongChange}
        placeholder={t('actions.room')}
      />

      <FilterSelect
        options={statusOptions}
        value={filters.status as string}
        onChange={handleStatusChange}
        placeholder={t('actions.status')}
      />
    </div>
  );
};
