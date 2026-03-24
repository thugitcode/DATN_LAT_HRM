import { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { ContractTypeEnum } from '@/types/staff.type';
import { StaffList } from '@/features/staff-management/staff-list-management/staff-list';

export const Route = createFileRoute('/_private/admin/_dashboard/staff-management/$type')({
  component: StaffManagementRoute,
});

function StaffManagementRoute() {
  const { type } = Route.useParams();
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const typeToConfig: Record<string, { title: string; contractType: ContractTypeEnum }> = useMemo(
    () => ({
      'official-staff': {
        title: t('staff_types.official'),
        contractType: ContractTypeEnum.FULL_TIME,
      },
      'probationary-staff': {
        title: t('staff_types.probationary'),
        contractType: ContractTypeEnum.PROBATION,
      },
      'apprentice-staff': {
        title: t('staff_types.apprentice'),
        contractType: ContractTypeEnum.INTERNSHIP,
      },
      'partner-staff': {
        title: t('staff_types.partner'),
        contractType: ContractTypeEnum.EXPERT_COOPERATION,
      },
    }),
    [t],
  );
  const config = typeToConfig[type];

  if (!config) {
    return <div>Trang không tồn tại</div>;
  }

  return <StaffList title={config.title} contractType={config.contractType} />;
}
