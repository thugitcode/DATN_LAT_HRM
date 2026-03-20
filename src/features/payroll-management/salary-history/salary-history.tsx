import { useMemo, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { useStaffList } from '@/hooks/queries/use-staff-query';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { PayrollManagementFilters } from '../components/payroll-management-filters';
import { statusKpiOptions } from '../constants/constants';
import { StaffList } from './components/staff-list';
import { StaffSalaryHistory } from './components/staff-salary-history';

export type StaffActive = {
  id: string;
  name: string;
  position: string;
};

export const SalaryHistory = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { filters } = useQueryFilter<RequestsParams>();

  const { data: staffList, isLoading } = useStaffList({
    getAll: true,
    search: filters.search,
  });
  const [activeStaffId, setActiveStaffId] = useState<string | null>(null);

  const resolvedActiveId = activeStaffId ?? staffList?.data?.[0]?.id ?? null;

  const activeStaff = useMemo(
    () => staffList?.data?.find((s) => s.id === resolvedActiveId) ?? null,
    [staffList?.data, resolvedActiveId],
  );

  return (
    <PageContainer className="space-y-3 px-0" variant="fixed">
      <TitlePage title={t('salary-history.title')} />
      <PayrollManagementFilters statusOptions={statusKpiOptions} />
      <div className="flex gap-6 h-[calc(100vh-210px)]">
        <StaffList
          staffList={staffList?.data ?? []}
          isLoading={isLoading}
          activeStaffId={activeStaffId}
          onSelect={setActiveStaffId}
        />
        <StaffSalaryHistory staff={activeStaff} />
      </div>
    </PageContainer>
  );
};
