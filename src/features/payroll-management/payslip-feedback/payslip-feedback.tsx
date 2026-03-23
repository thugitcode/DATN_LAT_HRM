import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ShiftManagementParams } from '@/types';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { usePaginationConfig } from '@/hooks/use-pagination-config';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { PageFilter } from '@/components/page-filter';
import { TitlePage } from '@/components/title-page';

import { usePayrollFeedbackColumns } from '../colums/use-payroll-feedback-columns';
import { usePayrollFeedbackList } from '../hooks/use-payroll-management';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-400px)]' } as const;

export const PayslipFeedback = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { columns } = usePayrollFeedbackColumns();

  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { departmentId, month, roomId, search, status, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);

  const { data, isLoading } = usePayrollFeedbackList({
    fromDate: startDate,
    toDate: endDate,
    month,
    search,
    status,
    page,
    limit,
    getAll: true,
  });

  const { paginationConfig } = usePaginationConfig({
    page,
    limit,
    total: data?.pagination?.total,
    totalPage: data?.pagination?.totalPage,
  });

  return (
    <PageContainer className="space-y-3">
      <TitlePage title={t('payslipFeedback.title')} />

      <PageFilter />

      <DataTable
        dataSource={[]}
        columns={columns}
        selectionMode="single"
        // loading={isLoading}
        classNames={TABLE_CLASS_NAMES}
        pagination={paginationConfig}
      />
    </PageContainer>
  );
};
