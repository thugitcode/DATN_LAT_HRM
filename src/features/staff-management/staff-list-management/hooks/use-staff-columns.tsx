import { NAMESPACES } from '@/i18n/constants';
import { Avatar, Button, Chip, Switch } from '@heroui/react';
import { IconMail, IconPencil, IconPhone } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';
import GetSignedUrl from '@/components/get-signed-url';
import type { Staff } from '@/types/staff.type';

export const renderStatusChip = (status: string | undefined, t: any) => {
  // Định nghĩa style dựa trên key i18n
  const statusConfig: Record<
    string,
    { color: 'success' | 'warning' | 'danger'; content: string; base: string }
  > = {
    WORKING: {
      color: 'success',
      content: 'text-[#17C964]',
      base: 'bg-[#E8FAF0]',
    },
    RESIGNED: {
      color: 'danger',
      content: 'text-danger',
      base: 'bg-danger-100',
    },
    PENDING: {
      color: 'warning',
      content: 'text-[#F5A524]',
      base: 'bg-[#FEFCE8]',
    },
  };

  // Fallback về RESIGNED style nếu status không khớp, nhưng vẫn ưu tiên dùng key i18n
  const config = status && statusConfig[status] ? statusConfig[status] : statusConfig.RESIGNED;
  const label = status ? t(`options.staff_status.${status}`) : t('options.staff_status.RESIGNED');

  return (
    <Chip
      size="sm"
      color={config?.color}
      classNames={{
        content: `${config?.content} font-medium text-[10px] px-1`,
        base: `h-5 ${config?.base}`,
      }}
    >
      {label}
    </Chip>
  );
};

export const useStaffColumns = () => {
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const columns: ColumnDef<Staff>[] = [
    {
      key: 'name',
      title: t('staff_table.columns.name'),
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
            <GetSignedUrl url={record.avatar || ''}>
              {(signedUrl) => {
                return (
                  <Avatar
                    src={
                      signedUrl ||
                      `https://ui-avatars.com/api/?name=${record.name || 'Staff'}&background=random`
                    }
                    className="w-full h-full object-cover"
                  />
                );
              }}
            </GetSignedUrl>
          </div>
          <div>
            <div className="font-semibold text-sm text-[#11181C] flex items-center gap-2">
              {record.name}
              {renderStatusChip(record.status as any, t)}
            </div>
            <div className="text-xs text-[#71717A] mt-0.5">
              {record.jobTitle ? t(`options.job_title.${record.jobTitle}` as any) : ''} -
              {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'birthday',
      title: t('staff_table.columns.birthday'),
      render: (_, record) => (
        <span className="text-sm text-[#11181C]">
          {record?.birthday
            ? new Date(record.birthday).toLocaleDateString(
              tc('locale') === 'en' ? 'en-US' : 'vi-VN',
            )
            : ''}
        </span>
      ),
    },
    {
      key: 'gender',
      title: t('staff_table.columns.gender'),
      render: (_, record) => (
        <span className="text-sm text-[#11181C]">
          {t(`staff_table.gender.${record.gender || 'OTHER'}`)}
        </span>
      ),
    },
    {
      key: 'contact',
      title: t('staff_table.columns.contact'),
      render: (_, record) => (
        <div className="flex flex-col gap-0.5 text-sm text-[#006FEE]">
          <span className="flex gap-1.5">
            <IconMail size={20} color="#000000" stroke="1px" /> {record.email}
          </span>
          <span className="flex gap-1.5">
            <IconPhone size={20} color="#000000" stroke="1px" /> {record.phone}
          </span>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      title: t('staff_table.columns.job_title'),
      render: (_, record) => (
        <span className="text-sm text-[#11181C]">
          {t(`options.job_title.${record.jobTitle}` as any)}
        </span>
      ),
    },
    {
      key: 'position',
      title: t('staff_table.columns.position'),
      render: (_, record) => (
        <span className="text-sm text-[#11181C]">
          {t(`options.staff_position.${record.position}` as any)}
        </span>
      ),
    },
    {
      key: 'departments',
      title: t('staff_table.columns.departments'),
      render: (_, record) => (
        <span className="text-sm text-[#11181C]">
          {Array.isArray(record?.departments) && record.departments.length > 0
            ? record.departments.map((d: any) => d.name).join(', ')
            : ''}
        </span>
      ),
    },
    {
      key: 'workType',
      title: t('staff_table.columns.work_type'),
      render: (_, record) => (
        <span className="text-sm text-[#11181C]">
          {record.workType ? t(`staff_table.work_type.${record.workType}` as any) : ''}
        </span>
      ),
    },
    {
      key: 'endDate',
      title: t('staff_table.columns.end_date'),
      render: (_, record) => (
        <span className="text-sm text-[#11181C]">
          {record?.endDate
            ? new Date(record.endDate).toLocaleDateString(tc('locale') === 'en' ? 'en-US' : 'vi-VN')
            : ''}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('staff_table.columns.actions'),
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Switch size="sm" isSelected={record.activeStatus === 'ACTIVE'} />
          <Button isIconOnly size="sm" variant="light" className="text-[#71717A]">
            <IconPencil size={18} stroke={1.5} />
          </Button>
        </div>
      ),
    },
  ];

  return { columns };
};
