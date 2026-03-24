import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { useTranslation } from 'react-i18next';

import type { ShiftManagementParams } from '@/types';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { usePaginationConfig } from '@/hooks/use-pagination-config';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { PageFilter } from '@/components/page-filter';
import { TitlePage } from '@/components/title-page';
import { useShiftManagementList } from '@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management';

import { usePayrollCalculationColumns } from '../colums/use-payroll-calculation-columns';
import { usePayrollCalculationList } from '../hooks/use-payroll-calculation';
import dayjs from 'dayjs';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-280px)]' } as const;

export const PayrollCalculation = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { columns } = usePayrollCalculationColumns();
  const { onOpen } = useDrawer();
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { departmentId, month, roomId, search, status, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);

  // useEffect(() => {
  //   onOpen(DrawerType.PAYROLL_CACULATION_DETAILS,)
  // }, [])

  const { data, isLoading, isError } = usePayrollCalculationList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    search: filters.search,
    month: month ?? dayjs().format("YYYY-MM"),
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    view: "result"
  });

  const { paginationConfig } = usePaginationConfig({
    page,
    limit,
    total: data?.pagination?.total,
    totalPage: data?.pagination?.totalPage,
  });

  return (
    <PageContainer className="space-y-3">
      <div className="flex items-center justify-between">
        <TitlePage title={t('payrollCalculation.title')} />

        {/* <div>Action</div> */}
      </div>

      <PageFilter />

      <DataTable
        dataSource={data?.data?.data ?? []}
        columns={columns}
        selectionMode="single"
        loading={isLoading}
        classNames={TABLE_CLASS_NAMES}
        pagination={paginationConfig}
      />
    </PageContainer>
  );
};
