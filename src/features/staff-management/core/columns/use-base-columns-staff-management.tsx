import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { safeTranslate } from '@/i18n/utils';
import { useTranslation } from 'react-i18next';

import type { Staff } from '@/types/staff.type';
import { toDDMMYYYY } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';

import { ContactCell } from '../components/contact-cell';
import { StaffNameCell } from '../components/staff-name-cell';

export const useBaseColumnsStaffManagement = () => {
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        key: 'name',
        title: t('staff_table.columns.name'),
        render: (_, record) => (
          <StaffNameCell
            record={record}
            jobTitle={record.jobTitle ? t(`options.job_title.${record.jobTitle}`) : ''}
            status={record.status}
          />
        ),
      },
      {
        key: 'birthday',
        title: t('staff_table.columns.birthday'),
        render: (_, record) => (
          <span className="text-sm text-primary">{toDDMMYYYY(record.birthday)}</span>
        ),
      },
      {
        key: 'gender',
        title: t('staff_table.columns.gender'),
        render: (_, record) => (
          <span className="text-sm text-primary">
            {t(`staff_table.gender.${record.gender ?? 'OTHER'}`)}
          </span>
        ),
      },
      {
        key: 'contact',
        title: t('staff_table.columns.contact'),
        render: (_, record) => <ContactCell email={record.email} phone={record.phone} />,
      },
      {
        key: 'jobTitle',
        title: t('staff_table.columns.job_title'),
        render: (_, record) => (
          <span className="text-sm text-primary">
            {record.jobTitle ? t(`options.job_title.${record.jobTitle}`) : '-'}
          </span>
        ),
      },
      {
        key: 'position',
        title: t('staff_table.columns.position'),
        render: (_, record) => (
          <span className="text-sm text-primary">
            {record.position ? t(`options.staff_position.${record.position}`) : '-'}
          </span>
        ),
      },
      {
        key: 'departments',
        title: t('staff_table.columns.departments'),
        render: (_, record) => (
          <span className="text-sm text-primary">
            {record.departments?.map((d) => d.name).join(', ') || '-'}
          </span>
        ),
      },
      {
        key: 'workType',
        title: t('staff_table.columns.work_type'),
        render: (_, record) => (
          <span className="text-sm text-primary">
            {safeTranslate(t, `staff_table.work_type.${record.workType}`)}
          </span>
        ),
      },
      {
        key: 'endDate',
        title: t('staff_table.columns.end_date'),
        render: (_, record) => (
          <span className="text-sm text-primary">
            {record.endDate ? toDDMMYYYY(record.endDate) : '-'}
          </span>
        ),
      },
    ],
    [t],
  );

  return { columns };
};
