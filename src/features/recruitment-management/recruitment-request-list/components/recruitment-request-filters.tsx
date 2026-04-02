import { useCallback } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';
import { MonthFilter } from '@/components/filters/month-filter';
import { SearchInput } from '@/components/filters/search-input';

import { RecruitmentRequestStatusEnum, type RecruitmentRequestFilters } from '../type';

const STATUS_OPTIONS = [
  { key: RecruitmentRequestStatusEnum.RECRUITING, label: 'Đang tuyển' },
  { key: RecruitmentRequestStatusEnum.PENDING, label: 'Chờ duyệt' },
  { key: RecruitmentRequestStatusEnum.CLOSED, label: 'Đã đóng' },
  { key: RecruitmentRequestStatusEnum.INTERVIEWING, label: 'Chờ phỏng vấn' },
] as const;

export const RecruitmentRequestFilterBar = () => {
  const { filters, setFilter } = useQueryFilter<RecruitmentRequestFilters>();
  const { t } = useTranslation(NAMESPACES.COMMON);

  const { options: departmentOptions } = useDepartmentOptions();
  const { options: roomOptions } = useRoomOptions(filters?.departmentIds);

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

  const handleDepartmentChange = useCallback(
    (value: string | undefined) => {
      setFilter('departmentIds', value);
    },
    [setFilter],
  );

  const handleRoomChange = useCallback(
    (value: string | undefined) => {
      setFilter('roomIds', value);
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
        value={filters.departmentIds as string}
        onChange={handleDepartmentChange}
        placeholder={t('actions.department')}
      />

      <FilterSelect
        options={roomOptions}
        value={filters.roomIds as string}
        onChange={handleRoomChange}
        placeholder={t('actions.room')}
      />

      <FilterSelect
        options={STATUS_OPTIONS}
        value={filters.status as string}
        onChange={handleStatusChange}
        placeholder={t('actions.status')}
      />
    </div>
  );
};
