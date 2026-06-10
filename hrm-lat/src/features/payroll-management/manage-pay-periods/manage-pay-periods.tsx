import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { BtnCreatePayPeriods } from '../components/btn-create-pay-periods';
import { ManagePayPeriodsFilters } from '../components/manage-pay-periods-filters';
import { PayPeriodsList } from './components/pay-periods-list';

export const ManagePayPeriods = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  return (
    <PageContainer className="space-y-3">
      <div className="flex items-center justify-between">
        <TitlePage title="Quản lý kỳ lương" />

        <BtnCreatePayPeriods />
      </div>

      <ManagePayPeriodsFilters />

      <PayPeriodsList />
    </PageContainer>
  );
};
