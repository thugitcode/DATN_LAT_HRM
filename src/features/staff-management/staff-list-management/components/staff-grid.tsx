import type { FC } from 'react';
import i18n from '@/i18n';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Chip, Pagination, Select, SelectItem, Switch } from '@heroui/react';
import {
  IconArrowRight,
  IconBriefcase,
  IconClock,
  IconMail,
  IconPencil,
  IconPhone,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { Staff } from '@/types/staff.type';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { translateJobTitle } from '../../time-attendance-management/helpers';
import { renderStatusChip } from '../hooks/use-staff-columns';

const translatePosition = (position: string) => {
  const positions: Record<string, string> = {
    STAFF: 'Nhân viên',
    HEAD_OF_DEPARTMENT: 'Trưởng khoa',
    DEPUTY_HEAD_OF_DEPARTMENT: 'Phó khoa',
    CHIEF_NURSE: 'Điều dưỡng trưởng',
    MANAGER: 'Trưởng phòng',
    HEAD_OF_UNIT: 'Trưởng bộ phận',
    DEPUTY_MANAGER: 'Phó phòng',
  };
  return positions[position] || position || '—';
};

interface StaffGridProps {
  data: Staff[];
  loading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetail?: (id: string) => void;
  onEdit?: (staff: Staff) => void;
}

export const StaffGrid: FC<StaffGridProps> = ({
  data,
  loading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onEdit,
}) => {
  const totalPages = Math.ceil((total || 1) / limit);
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const currentLocale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 mt-4">
        <div className="w-6 h-6 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 mt-4 h-full px-5">
      <div className="flex-1 overflow-y-auto pb-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#71717A] text-sm">
            Không có dữ liệu
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-[#F4F4F5] gap-3 p-4 flex flex-col shadow-sm"
              >
                {/* ... previous card content ... */}
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  {renderStatusChip(staff.status as unknown as string, t)}
                  <div className="flex items-center gap-2">
                    <Switch
                      size="sm"
                      isSelected={(staff.activeStatus as unknown as string) === 'ACTIVE'}
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-[#71717A] min-w-6 w-6 h-6"
                      onClick={() => onEdit?.(staff)}
                    >
                      {/* <icons size={16} stroke={1.5} /> */}
                      <icons.edit className="size-5" />
                    </Button>
                  </div>
                </div>

                {/* Avatar & Name */}
                <div className="flex flex-col items-center">
                  <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0 border border-gray-100">
                    <img
                      src={
                        staff.avatar ||
                        `https://ui-avatars.com/api/?name=${staff.name}&background=random`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium leading-6 text-base text-[#11181C] mt-3">
                    {staff.name}
                  </h3>
                  <p className="text-[14px] text-[#71717A] line-clamp-1">
                    {t(`options.job_title.${staff.jobTitle}` as any)} -{' '}
                    {staff.departments?.map((d: any) => d.name).join(', ') || '—'}
                  </p>
                </div>

                {/* Details Box */}
                <div className="bg-[#F4F4F5] rounded-xl p-3 border border-[#11111126] space-y-2">
                  <div className="font-medium text-[13px] text-[#11181C]">#&nbsp; {staff.code}</div>
                  <div className="flex gap-2 text-xs text-[#11181C]">
                    <div
                      className="flex flex-1 items-center gap-1.5 line-clamp-1"
                      title={t(`options.staff_position.${staff.position}` as any)}
                    >
                      <IconBriefcase className="stroke-1 size-3" />
                      {t(`options.staff_position.${staff.position}` as any)}
                    </div>
                    {staff.workType && (
                      <div className="flex flex-1 items-center gap-1.5 line-clamp-1">
                        <IconClock className="stroke-1 size-3" />
                        {staff.workType ? t(`options.work_type.${staff.workType}` as any) : '—'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#006FEE]">
                    <IconMail className="stroke-1 size-3  text-black" /> {staff.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#006FEE]">
                    <IconPhone className="stroke-1 size-3 text-black" /> {staff.phone}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 relative">
                  <div
                    className={cn(
                      !staff.endDate && 'opacity-0 pointer-events-none',
                      'text-[11px] text-[#71717A] flex items-center gap-1',
                    )}
                  >
                    {/* Dịch nhãn "Hết hạn HĐ" */}
                    {t('staff_card.contract_expiry')}:{' '}
                    <span className="font-medium text-[#11181C]">
                      {staff.endDate
                        ? new Date(staff.endDate).toLocaleDateString(currentLocale)
                        : t('staff_card.no_date')}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="light"
                    className="text-[11px] font-medium text-[#11181C] p-0 h-auto gap-1"
                    endContent={<IconArrowRight size={14} />}
                    onPress={() => onViewDetail?.(staff.id)}
                  >
                    {/* Dịch nhãn "Xem chi tiết" */}
                    {t('staff_card.view_detail')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination block */}
      <div className="flex items-center justify-between px-4 py-3 border border-[#F4F4F5] bg-white rounded-b-xl shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#71717A]">Page</span>
          <Select
            size="sm"
            variant="bordered"
            selectedKeys={[limit.toString()]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              onLimitChange(Number(value));
            }}
            className="w-[70px]"
            classNames={{
              trigger: 'h-8 min-h-8 rounded-lg',
            }}
          >
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="25">25</SelectItem>
            <SelectItem key="50">50</SelectItem>
            <SelectItem key="100">100</SelectItem>
          </Select>
          <span className="text-sm text-[#71717A]">of {totalPages}</span>
        </div>

        <Pagination
          total={totalPages || 1}
          page={page}
          onChange={onPageChange}
          showControls
          size="sm"
          classNames={{
            cursor: 'bg-[#006FEE] text-white',
          }}
        />
      </div>
    </div>
  );
};
