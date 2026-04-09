import { useCallback } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { StaffPositionEnum, StaffStatusEnum } from '@/types/staff.type';
import { icons } from '@/lib/icons';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useJobTitleOptions } from '@/hooks/select-options/use-job-title-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';
import { SearchInput } from '@/components/filters/search-input';

export const StaffManagementFilters = () => {
  const { filters, setFilter } = useQueryFilter<RequestsParams>();
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const { options: roomOptions } = useRoomOptions(filters?.departmentId);
  const { options: departmentOptions } = useDepartmentOptions();

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setFilter('search', value);
    },
    [setFilter],
  );

  const handleJobTitleChange = useCallback(
    (value: string | undefined) => {
      setFilter('jobTitleId', value);
    },
    [setFilter],
  );

  const handlePositionChange = useCallback(
    (value: string | undefined) => {
      setFilter('positions', value);
    },
    [setFilter],
  );

  const handleStatusChange = useCallback(
    (value: string | undefined) => {
      setFilter('status', value);
    },
    [setFilter],
  );

  const handleDepartmentChange = useCallback(
    (value: string | undefined) => {
      setFilter('departmentId', value);
      setFilter('roomId', undefined);
    },
    [setFilter],
  );

  const handleRoomChange = useCallback(
    (value: string | undefined) => {
      setFilter('roomId', value);
    },
    [setFilter],
  );

  const { options: jobTitleApiOptions } = useJobTitleOptions();
  const jobTitleOptions = jobTitleApiOptions.map((jt) => ({ key: jt.value, label: jt.label }));

  const positionOptions = Object.values(StaffPositionEnum).map((val) => ({
    key: val,
    label: t(`options.staff_position.${val}`),
  }));

  const statusOptions = Object.values(StaffStatusEnum).map((val) => ({
    key: val,
    label: t(`options.staff_status.${val}`),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <SearchInput value={filters.search} onChange={handleSearchChange} startIcon={icons.search} />

      <FilterSelect
        options={jobTitleOptions}
        value={filters.jobTitleId as string}
        onChange={handleJobTitleChange}
        placeholder={t('options.job_title.ALL')}
      />

      <FilterSelect
        options={positionOptions}
        value={filters.positions as unknown as string}
        onChange={handlePositionChange}
        placeholder={t('options.staff_position.ALL')}
      />

      <FilterSelect
        options={statusOptions}
        value={filters.status as string}
        onChange={handleStatusChange}
        placeholder={t('options.staff_status.ALL')}
      />

      <FilterSelect
        options={departmentOptions}
        value={filters.departmentId as string}
        onChange={handleDepartmentChange}
        placeholder={tc('actions.department')}
      />

      <FilterSelect
        options={roomOptions}
        value={filters.roomId as string}
        onChange={handleRoomChange}
        placeholder={tc('actions.room')}
      />
    </div>
  );
};
