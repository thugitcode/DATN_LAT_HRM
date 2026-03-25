import { NAMESPACES } from '@/i18n/constants';
import { exportOvertimeExcel } from '@/templates/excels/other-requests-management/export-overtime-excel';
import { PrintOvertime } from '@/templates/prints/other-requests-management/print-overtime';
import { useTranslation } from 'react-i18next';

import { RequestManagementPage } from '../core/components/request-management-page';
import { useRequestExport } from '../core/hooks/use-request-export';
import { useRequestManagementPage } from '../core/hooks/use-request-management-page';
import { useOtherRequestpManagement } from '../hooks/use-other-request-management';
import { useOvertimeColumns } from '../hooks/use-overtime-columns';
import { CategoryGeneralRequest } from '../types/generate-request.type';

const COMPANY_NAME = 'Bệnh viện đa khoa';
const UNIT_NAME = 'TRUNG TÂM Y TẾ';

export const OvertimeManagement = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const { columns } = useOvertimeColumns();

  const {
    startDate,
    endDate,
    departmentIds,
    roomIds,
    search,
    status,
    type,
    page,
    limit,
    month,
    departmentName,
    printRef,
    visibleColumns,
    handleApplyColumns,
    handlePrint,
    paginationConfig,
  } = useRequestManagementPage({ columns });

  const { data, isLoading } = useOtherRequestpManagement({
    fromDate: startDate,
    toDate: endDate,
    departmentIds,
    roomIds,
    search,
    status,
    type,
    page,
    limit,
    category: CategoryGeneralRequest.OVERTIME,
  });

  const { handleExport } = useRequestExport({
    data: data?.data ?? [],
    month,
    companyName: COMPANY_NAME,
    unitName: UNIT_NAME,
    departmentName,
    exportFn: exportOvertimeExcel,
  });

  return (
    <RequestManagementPage
      title={t('overtimeManagement.title')}
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      pagination={paginationConfig}
      onExport={handleExport}
      onPrint={handlePrint}
      visibleColumns={visibleColumns}
      onApplyColumns={handleApplyColumns}
      printContent={
        <PrintOvertime
          ref={printRef}
          data={data?.data ?? []}
          month={month}
          companyName={COMPANY_NAME}
          unitName={UNIT_NAME}
          departmentName={departmentName}
        />
      }
    />
  );
};
