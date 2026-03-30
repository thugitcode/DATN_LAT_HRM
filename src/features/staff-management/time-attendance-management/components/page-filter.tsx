import { NAMESPACES } from '@/i18n/constants';
import { useParams } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterSelect } from '@/components/filters/filter-select';
import { MonthFilter } from '@/components/filters/month-filter';
import { SearchInput } from '@/components/filters/search-input';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { icons } from '@/lib/icons';
import { useStaffDetail } from '@/query-options/staff';
import type { ShiftManagementParams } from '@/types';
import { AttendanceExplanationType } from '@/types/attendance-explanation.type';

export const PageFilter = ({ showSearch = true, showExplanationType = true }: { showSearch?: boolean, showExplanationType?: boolean }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { id } = useParams({ strict: false });

  const { filters, setFilter } = useQueryFilter<ShiftManagementParams>();

  const { data: staffResponse } = useStaffDetail(id as string);
  const staff = staffResponse?.data;

  // const { options: roomOptions } = useRoomOptions(filters?.departmentId);
  // const { options: departmentOptions } = useDepartmentOptions();
  const departmentOptions = staff?.rlsStaffDepartments?.map((item) => ({
    label: item.department.name,
    key: item.department.id,
  })) || []
  const defaultRoomOptions = staff?.rlsStaffRooms?.map((item) => ({
    label: item.room.name ?? "",
    key: item.room.id,
    ...item.room
  })) || []
  useEffect(() => {
    if (!staff) return;
    if (!filters.departmentId && staff.departments?.[0]?.id) {
      setFilter('departmentId', staff.departments[0].id);
    }
    if (!filters.roomId && staff.rooms?.[0]?.id) {
      setFilter('roomId', staff.rooms[0].id);
    }
  }, [staff]);

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

  const handleExplanationTypeChange = useCallback(
    (value: string | undefined) => {
      setFilter('type', value as AttendanceExplanationType | undefined);
    },
    [setFilter],
  );

  const explanationTypeOptions = useMemo(
    () =>
      Object.values(AttendanceExplanationType).map((type) => ({
        key: type,
        label: t(`actions.explanation_types.${type}`),
      })),
    [t],
  );

  return (
    <div className="flex items-center gap-3 justify-between">
      <MonthFilter value={filters.month} onChange={handleMonthChange} />

      {showSearch && <SearchInput value={filters.search} onChange={handleSearchChange} startIcon={icons.search} />}
      {showExplanationType && <FilterSelect
        options={explanationTypeOptions}
        value={filters.type}
        onChange={handleExplanationTypeChange}
        placeholder={t('actions.explanation_type')}
      />}
      <FilterSelect
        options={departmentOptions}
        value={filters.departmentId as string}
        onChange={handleKhoaChange}
        placeholder={t('actions.department')}
      />

      <FilterSelect
        options={filters?.departmentId ? defaultRoomOptions?.filter(it => it.department.id === filters.departmentId) : defaultRoomOptions}
        value={filters.roomId as string}
        onChange={handlePhongChange}
        placeholder={t('actions.room')}
      />

    </div>
  );
};
