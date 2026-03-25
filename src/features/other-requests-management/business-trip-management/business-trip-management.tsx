import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { exportBusinessTripExcel } from '@/templates/excels/other-requests-management/export-business-trip-excel';
import { PrintBusinessTrip } from '@/templates/prints/other-requests-management/print-business-trip';
import { useTranslation } from 'react-i18next';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';

import { RequestManagementPage } from '../core/components/request-management-page';
import { useRequestExport } from '../core/hooks/use-request-export';
import { useRequestManagementPage } from '../core/hooks/use-request-management-page';
import { useBusinessTripColumns } from '../hooks/use-business-trip-columns';
import { useOtherRequestpManagement } from '../hooks/use-other-request-management';
import { CategoryGeneralRequest } from '../types/generate-request.type';

const COMPANY_NAME = 'Bệnh viện đa khoa';
const UNIT_NAME = 'TRUNG TÂM Y TẾ';

export const BusinessTripManagement = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);

  const { columns } = useBusinessTripColumns();

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
    category: CategoryGeneralRequest.BUSINESS_TRIP,
  });

  const { handleExport } = useRequestExport({
    data: data?.data ?? [],
    month,
    companyName: COMPANY_NAME,
    unitName: UNIT_NAME,
    departmentName,
    exportFn: exportBusinessTripExcel,
  });

  const paginationConfig = useMemo(
    () => ({
      current: Number(page),
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      total: data?.pagination?.total,
      pageSize: Number(limit),
      totalPage: data?.pagination?.totalPage,
    }),
    [page, data?.pagination?.total, data?.pagination?.totalPage, limit],
  );

  return (
    <>
      <RequestManagementPage
        title={t('businessTripManagement.title')}
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={paginationConfig}
        onExport={handleExport}
        onPrint={handlePrint}
        visibleColumns={visibleColumns}
        onApplyColumns={handleApplyColumns}
        printContent={
          <PrintBusinessTrip
            ref={printRef}
            data={data?.data ?? []}
            month={month}
            companyName={COMPANY_NAME}
            unitName={UNIT_NAME}
            departmentName={departmentName}
          />
        }
      />
    </>
  );
};
