import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { useStaffDetail } from '@/query-options/staff';
import { PrintSalarySlip } from '@/templates/prints/payroll-management/print-salary-slip';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';

import { useQueryFilter } from '@/hooks/useQueryFilter';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { PageContainer } from '@/components/page-container';
import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { PageHeader } from '../components/page-header';
import { usePayrollCalculationResultDetail } from '../hooks/use-payroll-calculation';
import { SalarySlip } from './components/salary-slip';

export const PayrollCalculationDetail = () => {
  const { id } = useParams({
    from: '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id',
  });

  const { staffId, month, page } = useSearch({
    from: '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id',
  });
  const printRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { data: response, isLoading } = usePayrollCalculationResultDetail(id);
  const data = response?.data;
  const { filters } = useQueryFilter();
  const [currentStaff, setCurrentStaff] = useState<StaffTimeKeeping | undefined>(undefined);

  const { data: staffDetail } = useStaffDetail(staffId!);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentStaff(staffDetail?.data as StaffTimeKeeping);
  }, [staffDetail]);

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
                search: { month, page },
              })
            }
            currentStaff={currentStaff}
            setCurrentStaff={setCurrentStaff}
            onPrint={handlePrint}
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
