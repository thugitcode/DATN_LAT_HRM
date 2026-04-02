import { useCallback, useMemo } from 'react';
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

export const RecruitmentRequestFilterBar = () => {
  const { filters, setFilter } = useQueryFilter<RecruitmentRequestFilters>();
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { t: tR } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const statusOptions = useMemo(
    () => [
      { key: RecruitmentRequestStatusEnum.DRAFT, label: tR('recruitment_request.status.draft') },
      { key: RecruitmentRequestStatusEnum.PENDING, label: tR('recruitment_request.status.pending') },
      { key: RecruitmentRequestStatusEnum.REJECTED, label: tR('recruitment_request.status.rejected') },
      { key: RecruitmentRequestStatusEnum.APPROVED, label: tR('recruitment_request.status.approved') },
      { key: RecruitmentRequestStatusEnum.RECRUITING, label: tR('recruitment_request.status.recruiting') },
      { key: RecruitmentRequestStatusEnum.PAUSED, label: tR('recruitment_request.status.paused') },
      { key: RecruitmentRequestStatusEnum.CANCELLED, label: tR('recruitment_request.status.cancelled') },
      { key: RecruitmentRequestStatusEnum.CLOSED, label: tR('recruitment_request.status.closed') },
    ],
    [tR],
  );

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
        options={statusOptions}
        value={filters.status as string}
        onChange={handleStatusChange}
        placeholder={t('actions.status')}
      />
    </div>
  );
};
