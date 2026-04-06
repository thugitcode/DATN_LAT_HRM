import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ShiftManagementParams } from '@/types';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';

import { PayslipFeedbackStatus } from '../types/payslip-feedback.type';

export const StatusFilter = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { filters, setFilter } = useQueryFilter<ShiftManagementParams>();

  const options = useMemo(
    () =>
      Object.values(PayslipFeedbackStatus).map((status) => ({
        key: status,
        label: t(`payslipFeedback.feedbackStatus.${status}`),
      })),
    [t],
  );

  return (
    <FilterSelect
      options={options}
      value={filters.status}
      onChange={(value) => setFilter('status', value)}
      placeholder={t('payslipFeedback.columns.status')}
    />
  );
};
