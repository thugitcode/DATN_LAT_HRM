import i18n from '@/i18n';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Pagination, Select, SelectItem, Switch } from '@heroui/react';
import {
  IconArrowRight,
  IconBriefcase,
  IconClock,
  IconMail,
  IconPhone
} from '@tabler/icons-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { ActiveStatusEnum, type Staff } from '@/types/staff.type';

import { renderStatusChip } from '../hooks/use-staff-columns';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { useUpdateStaff } from '@/query-options/staff';
import { useConfirmStore } from '@/store/useConfirmStore';

interface StaffGridProps {
  data: Staff[];
  loading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetail?: (id: string) => void;
  // onEdit?: (staff: Staff) => void;
  onEdit?: (id: string) => void;
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
  const totalPages = Math.ceil((total || 1) / (limit ?? 12));
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const currentLocale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
  const { mutate: updateStaff, isPending: isUpdatingStatus } = useUpdateStaff();
  const openConfirm = useConfirmStore((state) => state.open);

  const handleToggleStatus = (staff: Staff, checked: boolean) => {
    const nextStatus = checked ? ActiveStatusEnum.ACTIVE : ActiveStatusEnum.INACTIVE;
    openConfirm(
      {
        title: checked ? t('staff_table.activate_title') : t('staff_table.deactivate_title'),
        description: checked ? t('staff_table.activate_confirm', { name: staff.name }) : t('staff_table.deactivate_confirm', { name: staff.name }),
        confirmLabel: tc('button.confirm'),
        confirmColor: 'primary'
      },
      async () => {
        updateStaff({ id: staff.id, data: { activeStatus: nextStatus } });
      },
    );
  };

  return (
    <LoadingWrapper isLoading={!!loading} height='50vh'>
      <div className="flex-1 flex flex-col min-h-0 mt-4 overflow-hidden h-[calc(100vh-285px)] px-5">
        <div className="flex-1 pb-4 overflow-y-auto h-[calc(100vh-305px)]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#71717A] text-sm">
              {tc('table.empty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-2xl border border-[#F4F4F5] gap-3 p-4 flex flex-col justify-between shadow-sm"
                >
                  {/* ... previous card content ... */}
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    {renderStatusChip(staff.status as unknown as string, t)}
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        isSelected={staff.activeStatus === ActiveStatusEnum.ACTIVE}
                        // isDisabled={isUpdatingStatus}
                        onValueChange={(checked) => handleToggleStatus(staff, checked)}
                      />
                      {staff?.activeStatus === ActiveStatusEnum.ACTIVE && <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-[#71717A] min-w-6 w-6 h-6"
                        onPress={() => onEdit?.(staff.id)}
                      >
                        {/* <icons size={16} stroke={1.5} /> */}
                        <icons.edit className="size-5" />
                      </Button>}
                    </div>
                  </div>
                  {/* Avatar & Name */}
                  <div className="flex flex-col items-center">
                    <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0 border border-gray-100">
                      <StaffAvatar
                        avatarUrl={staff.avatar}
                        name={staff.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium leading-6 text-base text-[#11181C] mt-3">
                      {staff.name}
                    </h3>
                    <p className="text-[14px] text-[#71717A] line-clamp-1">
                      {staff.jobTitle?.name ?? '—'} -{' '}
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
                          {staff.workType ? t(`staff_table.work_type.${staff.workType}` as any) : '—'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6576FF]">
                      <IconMail className="stroke-1 size-3  text-black" /> {staff.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6576FF]">
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
                      className="text-[11px] font-medium text-[#11181C] p-1 h-auto gap-1"
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
              selectedKeys={[(limit ?? 12).toString()]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                value && onLimitChange(Number(value));
              }}
              className="w-[70px]"
              classNames={{
                trigger: 'h-8 min-h-8 rounded-lg',
              }}
            >
              <SelectItem key="12">12</SelectItem>
              <SelectItem key="24">24</SelectItem>
              <SelectItem key="48">48</SelectItem>
              <SelectItem key="96">96</SelectItem>
            </Select>
            <span className="text-sm text-[#71717A]">of {totalPages}</span>
          </div>
          <Pagination
            total={totalPages || 1}
            page={Number(page)}
            onChange={onPageChange}
            showControls
            size="sm"
            classNames={{
              cursor: 'bg-[#6576FF] text-white',
            }}
          />
        </div>
      </div>
    </LoadingWrapper>
  );
};
