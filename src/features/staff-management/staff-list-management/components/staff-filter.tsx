// StaffFilters.tsx
import { NAMESPACES } from '@/i18n/constants';
import { Input, Select, SelectItem } from '@heroui/react';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { StaffPositionEnum, StaffStatusEnum } from '@/types/staff.type';
import { useJobTitleOptions } from '@/hooks/select-options/use-job-title-options';

import { positionOptions } from '../constants/constants';

interface StaffFiltersProps {
  filters: {
    search?: string;
    jobTitleId?: string;
    positions?: string[];
    status?: string;
    departmentId?: string;
    roomId?: string;
  };
  setFilters: (f: Partial<StaffFiltersProps['filters']>) => void;
  deptLoading?: boolean;
  roomLoading?: boolean;
  departmentOptions: { value: string; label: string }[];
  roomOptions: { value: string; label: string }[];
}

export const StaffFilters: React.FC<StaffFiltersProps> = ({
  filters,
  setFilters,
  deptLoading,
  roomLoading,
  departmentOptions,
  roomOptions,
}) => {
  const baseClass = 'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10';
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const { options: jobTitleOptions } = useJobTitleOptions();
  const handleSelectChange = (
    key: keyof StaffFiltersProps['filters'],
    val: string,
    isArray?: boolean,
  ) => {
    if (val === 'ALL') {
      setFilters({ [key]: undefined });
    } else {
      setFilters({ [key]: isArray ? [val] : val });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4 px-5">
      {/* Search */}
      <Input
        placeholder={tc('actions.search')}
        startContent={<IconSearch size={18} className="text-[#A1A1AA]" />}
        value={filters.search || ''}
        onValueChange={(val) => setFilters({ search: val })}
        classNames={{ inputWrapper: baseClass }}
        isClearable
      />

      {/* Job Title */}
      <Select
        placeholder={t('options.job_title.ALL')}
        classNames={{ trigger: baseClass }}
        selectedKeys={filters.jobTitleId ? [filters.jobTitleId] : ['ALL']}
        onSelectionChange={(keys) => handleSelectChange('jobTitleId', Array.from(keys)[0] as string)}
      >
        {[
          <SelectItem key="ALL">{t('options.job_title.ALL')}</SelectItem>,
          ...jobTitleOptions.map((jt) => (
            <SelectItem key={jt.value}>{jt.label}</SelectItem>
          )),
        ]}
      </Select>

      {/* Position */}
      <Select
        placeholder={t('options.staff_position.ALL')}
        classNames={{ trigger: baseClass }}
        // Xử lý selectedKeys: nếu có filters.positions thì lấy giá trị đầu, không thì mặc định 'ALL'
        selectedKeys={[filters.positions?.[0] ?? 'ALL']}
        onSelectionChange={(keys) => {
          const selectedValue = Array.from(keys)[0] as string;
          // Truyền true vào handleSelectChange nếu bạn xử lý filter dạng mảng (multiple)
          handleSelectChange('positions', selectedValue, true);
        }}
        // isClearable
      >
        {[
          <SelectItem key="ALL">{t('options.staff_position.ALL')}</SelectItem>,
          ...Object.values(StaffPositionEnum).map((status) => (
            <SelectItem key={status}>{t(`options.staff_position.${status}`)}</SelectItem>
          )),
        ]}
      </Select>

      {/* Status */}
      <Select
        placeholder={t('options.staff_status.ALL')}
        classNames={{ trigger: baseClass }}
        // Đảm bảo selectedKeys luôn là một mảng để tránh lỗi UI
        selectedKeys={filters.status ? [filters.status] : ['ALL']}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as string;
          handleSelectChange('status', value);
        }}
        // isClearable
      >
        {/* Option mặc định */}
        {[
          <SelectItem key="ALL">{t('options.staff_status.ALL')}</SelectItem>,
          ...Object.values(StaffStatusEnum).map((status) => (
            <SelectItem key={status}>{t(`options.staff_status.${status}`)}</SelectItem>
          )),
        ]}
      </Select>

      {/* Department */}
      <Select
        placeholder={tc('actions.department')}
        isLoading={deptLoading}
        classNames={{ trigger: baseClass }}
        selectedKeys={filters.departmentId ? [filters.departmentId] : ['ALL']}
        onSelectionChange={(keys) => {
          const val = Array.from(keys)[0] as string;
          setFilters({
            departmentId: val === 'ALL' ? undefined : val,
            roomId: undefined,
          });
        }}
        isClearable
      >
        {departmentOptions.map((opt) => (
          <SelectItem key={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>

      {/* Room */}
      <Select
        isClearable
        placeholder={tc('actions.room')}
        isLoading={roomLoading}
        classNames={{ trigger: baseClass }}
        selectedKeys={filters.roomId ? [filters.roomId] : ['ALL']}
        onSelectionChange={(keys) => handleSelectChange('roomId', Array.from(keys)[0] as string)}
      >
        {roomOptions.map((opt) => (
          <SelectItem key={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
};
