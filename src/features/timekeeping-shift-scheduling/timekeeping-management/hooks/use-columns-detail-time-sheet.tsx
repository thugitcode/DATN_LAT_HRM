import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

export const useColumnsDetailTimeSheet = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const columns = useMemo(
    () => [
      {
        className: 'w-[150px] text-left',
        key: 'date',
        label: t('detailed_time_sheet.columns.date'),
      },
      {
        className: 'w-[135px] text-left',
        key: 'shiftCode',
        label: t('detailed_time_sheet.columns.shift_code'),
      },
      {
        className: 'w-[195px] text-left',
        key: 'standardHours',
        label: t('detailed_time_sheet.columns.standard_hours'),
      },
      {
        className: 'text-center',
        key: 'checkIn',
        label: t('detailed_time_sheet.columns.check_in'),
      },
      {
        className: 'text-center',
        key: 'checkOut',
        label: t('detailed_time_sheet.columns.check_out'),
      },
      {
        className: 'text-center',
        key: 'lateMinutes',
        label: t('detailed_time_sheet.columns.late_minutes'),
      },
      {
        className: 'text-center',
        key: 'earlyMinutes',
        label: t('detailed_time_sheet.columns.early_minutes'),
      },
      {
        className: 'text-center',
        key: 'workCount',
        label: t('detailed_time_sheet.columns.work_count'),
      },
      {
        className: 'text-center',
        key: 'totalWorkHours',
        label: t('detailed_time_sheet.columns.total_work_hours'),
      },
      {
        className: 'text-center',
        key: 'overtimeHours',
        label: t('detailed_time_sheet.columns.overtime_hours'),
      },
      {
        className: 'text-center',
        key: 'compHours',
        label: t('detailed_time_sheet.columns.comp_hours'),
      },
    ],
    [t],
  );

  return {
    columns,
  };
};
