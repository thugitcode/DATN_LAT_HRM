import { ActionsPage } from '@/components/actions-page';
import { PageContainer } from '@/components/page-container';

export const RecruitmentManagement = () => {
  return (
    <PageContainer className="space-y-3">
      <div className="flex items-center justify-between">
        <ActionsPage />
      </div>
    </PageContainer>
  );
};
