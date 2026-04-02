import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { ActionsPage } from '@/components/actions-page';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

export const RecruitmentManagement = () => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <PageContainer className="space-y-3">
      <div className="flex items-center justify-between">
        {/* <TitlePage title={t('title')} /> */}
        <ActionsPage />
      </div>
    </PageContainer>
  );
};
