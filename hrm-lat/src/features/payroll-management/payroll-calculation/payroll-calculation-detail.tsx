import { PrintSalarySlip } from '@/templates/prints/payroll-management/print-salary-slip';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { LoadingWrapper } from '@/components/loading-wrapper';
import { PageContainer } from '@/components/page-container';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import type { ShiftManagementParams } from '@/types';
import dayjs from 'dayjs';
import { usePayrollCalculationList, usePayrollCalculationResultDetail } from '../hooks/use-payroll-calculation';
import type { StaffPayroll } from '../types/payroll-caculation.type';
import { PageHeader } from './components/page-header';
import { SalarySlip } from './components/salary-slip';

export const PayrollCalculationDetail = () => {
  const { id } = useParams({
    from: '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id',
  });

  const { staffId } = useSearch({
    from: '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id',
  });
  const { filters } = useQueryFilter<ShiftManagementParams>();

  const { data: list, } = usePayrollCalculationList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    search: filters.search,
    month: filters?.month ?? dayjs().format('YYYY-MM'),
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    view: 'result',
  });

  const printRef = useRef<HTMLDivElement>(null);

  const [currentPayroll, setCurrentPayroll] = useState<StaffPayroll | undefined>(undefined);

  const { data: response, isLoading } = usePayrollCalculationResultDetail(currentPayroll?.payrollResultId ?? id);
  const data = response?.data;

  const navigate = useNavigate();

  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <>
      <LoadingWrapper isLoading={isLoading}>
        <PageContainer className="space-y-4">
          <PageHeader
            handleBack={() =>
              navigate({
                to: '/admin/payroll-management/payroll-calculation',
                search: { month: filters.month, page: filters.page },
              })
            }
            onPrint={handlePrint}
            handleNext={() => setCurrentPayroll(list?.data?.data?.[list?.data?.data?.findIndex((item) => item.staffId === staffId) + 1])}
            handlePrev={() => setCurrentPayroll(list?.data?.data?.[list?.data?.data?.findIndex((item) => item.staffId === staffId) - 1])}
          />
          <SalarySlip data={data} />
        </PageContainer>
      </LoadingWrapper>

      <div className="hidden">
        <PrintSalarySlip ref={printRef} data={data} companyName="" unitName="" />
      </div>
    </>
  );
};
