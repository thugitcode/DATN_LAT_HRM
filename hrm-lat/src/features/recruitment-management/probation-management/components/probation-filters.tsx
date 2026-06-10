import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';
import { SearchInput } from '@/components/filters/search-input';
import { icons } from '@/lib/icons';

import { ProbationStatusEnum, type ProbationFilters } from '../types/probation.type';

export const ProbationFilterBar = () => {
  const { filters, setFilter } = useQueryFilter<ProbationFilters>();
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { t: tR } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const { options: departmentOptions } = useDepartmentOptions();
  const { options: roomOptions } = useRoomOptions(filters?.departmentId);

  const statusOptions = useMemo(
    () =>
      Object.values(ProbationStatusEnum).map((status) => ({
        key: status,
        label: tR(`probation.status.${status.toLowerCase()}` as any),
      })),
    [tR],
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => setFilter('search', value),
    [setFilter],
  );

  const handleDepartmentChange = useCallback(
    (value: string | undefined) => setFilter('departmentId', value),
    [setFilter],
  );

  const handleRoomChange = useCallback(
    (value: string | undefined) => setFilter('roomId', value),
    [setFilter],
  );

  const handleStatusChange = useCallback(
    (value: string | undefined) => setFilter('status', value),
    [setFilter],
  );

  return (
    <div className="flex items-center gap-3">
      <SearchInput
        value={filters.search}
        onChange={handleSearchChange}
        startIcon={icons.search}
        placeholder={tR('probation.filters.search_placeholder')}
      />

      <FilterSelect
        options={departmentOptions}
        value={filters.departmentId as string}
        onChange={handleDepartmentChange}
        placeholder={t('actions.department')}
      />

      <FilterSelect
        options={roomOptions}
        value={filters.roomId as string}
        onChange={handleRoomChange}
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
