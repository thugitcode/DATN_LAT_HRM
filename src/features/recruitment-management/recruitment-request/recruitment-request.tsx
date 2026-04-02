import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

export const RecruitmentRequest = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);

  return (
    <PageContainer className="space-y-3">
      <TitlePage title={t('sidebar.recruitment_request')} />
    </PageContainer>
  );
};
