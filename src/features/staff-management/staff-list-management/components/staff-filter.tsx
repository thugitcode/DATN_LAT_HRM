// StaffFilters.tsx
import { Input, Select, SelectItem } from '@heroui/react';
import { IconSearch } from '@tabler/icons-react';

interface StaffFiltersProps {
  filters: {
    search?: string;
    jobTitle?: string;
    positions?: string[];
    status?: string;
    departmentId?: string;
    roomId?: string;
  };
  setFilters: (f: Partial<StaffFiltersProps['filters']>) => void;
  deptLoading?: boolean;
  roomLoading?: boolean;
  departmentOptions: { key: string; label: string }[];
  roomOptions: { key: string; label: string }[];
  position_options: { key: string; label: string }[];
}

export const StaffFilters: React.FC<StaffFiltersProps> = ({
  filters,
  setFilters,
  deptLoading,
  roomLoading,
  departmentOptions,
  roomOptions,
  position_options,
}) => {
  const baseClass =
    'bg-white border-1 border-[#E4E4E7] shadow-sm rounded-xl h-10';

  const handleSelectChange = (
    key: keyof StaffFiltersProps['filters'],
    val: string,
    isArray?: boolean
  ) => {
    if (val === 'ALL') {
      setFilters({ [key]: undefined });
    } else {
      setFilters({ [key]: isArray ? [val] : val });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
      {/* Search */}
      <Input
        placeholder="Tìm kiếm"
        startContent={<IconSearch size={18} className="text-[#A1A1AA]" />}
        value={filters.search || ''}
        onValueChange={(val) => setFilters({ search: val })}
        classNames={{ inputWrapper: baseClass }}
      />

      {/* Job Title */}
      <Select
        placeholder="Chức danh"
        classNames={{ trigger: baseClass }}
        selectedKeys={filters.jobTitle ? [filters.jobTitle] : ['ALL']}
        onSelectionChange={(keys) =>
          handleSelectChange('jobTitle', Array.from(keys)[0] as string)
        }
      >
        <SelectItem key="ALL">Tất cả chức danh</SelectItem>
        <SelectItem key="DOCTOR">Bác sĩ</SelectItem>
        <SelectItem key="NURSE">Điều dưỡng</SelectItem>
        <SelectItem key="TECHNICIAN">Kỹ thuật viên</SelectItem>
        <SelectItem key="MIDWIFE">Hộ sinh</SelectItem>
        <SelectItem key="PHYSICIAN_ASSISTANT">Y sĩ</SelectItem>
        <SelectItem key="PHARMACIST">Dược sĩ</SelectItem>
        <SelectItem key="RECEPTIONIST">Lễ tân</SelectItem>
        <SelectItem key="MANAGEMENT">Quản trị</SelectItem>
      </Select>

      {/* Position */}
      <Select
        placeholder="Cấp bậc"
        classNames={{ trigger: baseClass }}
        selectedKeys={filters.positions ? [filters.positions[0]] : 'ALL'}
        onSelectionChange={(keys) =>
          handleSelectChange('positions', Array.from(keys)[0] as string, true)
        }
      >
        <SelectItem key="ALL">Tất cả cấp bậc</SelectItem>
        {position_options.map((o) => (
          <SelectItem key={o.key}>{o.label}</SelectItem>
        ))}
      </Select>

      {/* Status */}
      <Select
        placeholder="Trạng thái"
        classNames={{ trigger: baseClass }}
        selectedKeys={filters.status ? [filters.status] : ['ALL']}
        onSelectionChange={(keys) =>
          handleSelectChange('status', Array.from(keys)[0] as string)
        }
      >
        <SelectItem key="ALL">Tất cả trạng thái</SelectItem>
        <SelectItem key="WORKING">Đang làm việc</SelectItem>
        <SelectItem key="PENDING">Chờ duyệt</SelectItem>
        <SelectItem key="RESIGNED">Đã nghỉ</SelectItem>
      </Select>

      {/* Department */}
      <Select
        placeholder="Khoa"
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
      >
        <SelectItem key="ALL">Tất cả khoa</SelectItem>
        {departmentOptions.map((opt) => (
          <SelectItem key={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>

      {/* Room */}
      <Select
        placeholder="Phòng"
        isLoading={roomLoading}
        classNames={{ trigger: baseClass }}
        selectedKeys={filters.roomId ? [filters.roomId] : ['ALL']}
        onSelectionChange={(keys) =>
          handleSelectChange('roomId', Array.from(keys)[0] as string)
        }
      >
        <SelectItem key="ALL">Tất cả phòng</SelectItem>
        {roomOptions.map((opt) => (
          <SelectItem key={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
};