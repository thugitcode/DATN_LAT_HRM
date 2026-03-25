import { useRef } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { exportPayrollCalculationExcel } from '@/templates/excels/payroll-management/export-payroll-calculation-excel';
import { PrintPayrollCalculation } from '@/templates/prints/payroll-management/payroll-caculation';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';

import type { ShiftManagementParams } from '@/types';
import { useDepartmentName } from '@/hooks/use-department-name';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { usePaginationConfig } from '@/hooks/use-pagination-config';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { PageFilter } from '@/components/page-filter';
import { TitlePage } from '@/components/title-page';

import { usePayrollCalculationColumns } from '../colums/use-payroll-calculation-columns';
import { usePayrollCalculationList } from '../hooks/use-payroll-calculation';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-260px)]' } as const;

export const PayrollCalculation = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const printRef = useRef<HTMLDivElement>(null);

  const { columns } = usePayrollCalculationColumns();
  const { onOpen } = useDrawer();
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { departmentId, month, roomId, search, status, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const { departmentName } = useDepartmentName({ departmentId });

  // useEffect(() => {
  //   onOpen(DrawerType.PAYROLL_CACULATION_DETAILS,)
  // }, [])

  const { data, isLoading, isError } = usePayrollCalculationList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    search: filters.search,
    month: month ?? dayjs().format('YYYY-MM'),
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    view: 'result',
  });

  const { paginationConfig } = usePaginationConfig({
    page,
    limit,
    total: data?.pagination?.total,
    totalPage: data?.pagination?.totalPage,
  });

  const handleExport = () => {
    exportPayrollCalculationExcel({
      data: data?.data?.data ?? [],
      month,
      departmentName,
      t,
    });
  };

  return (
    <PageContainer className="space-y-3">
      <div className="flex items-center justify-between">
        <TitlePage title={t('payrollCalculation.title')} />

        <ActionsPage onPrint={handlePrint} onExport={handleExport} hiddenLayoutSwitcher />
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

      <div className="hidden">
        <PrintPayrollCalculation
          ref={printRef}
          data={data?.data?.data ?? []}
          month={month}
          departmentName={departmentName}
        />
      </div>
    </PageContainer>
  );
};
