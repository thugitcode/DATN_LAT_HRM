import { LoadingWrapper } from '@/components/loading-wrapper';
import { PageContainer } from '@/components/page-container';
import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';
import { NAMESPACES } from '@/i18n/constants';
import { useStaffDetail } from '@/query-options/staff';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/page-header';
import { usePayrollCalculationResultDetail } from '../hooks/use-payroll-calculation';
import { SalarySlip } from './components/salary-slip';

export const PayrollCalculationDetail = () => {
    const { id } = useParams({ from: '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id' });
    const { staffId } = useSearch({ from: '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id' });

    const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
    const { data: response, isLoading } = usePayrollCalculationResultDetail(id);
    const data = response?.data

    const [currentStaff, setCurrentStaff] = useState<StaffTimeKeeping | undefined>(undefined)

    const { data: staffDetail } = useStaffDetail(staffId!)

    useEffect(() => {
        setCurrentStaff(staffDetail?.data as StaffTimeKeeping)
    }, [staffDetail])
    const navigate = useNavigate()
    return (
        <LoadingWrapper isLoading={isLoading}>
            <PageContainer className="space-y-4">
                <PageHeader handleBack={() => navigate({ to: '/_private/admin/_dashboard/payroll-management/payroll-calculation' })} currentStaff={currentStaff} setCurrentStaff={setCurrentStaff} />
                <SalarySlip data={data} />
            </PageContainer>
        </LoadingWrapper>
    );
};
