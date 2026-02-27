import { PageContainer } from '@/components/page-container';
import { PageFilters } from '@/components/page-filters';
import { TitlePage } from '@/components/title-page';

import { ExplanationSummary } from './components/explanation-summary';
import { statusAccountabilityOptions } from './constants/data';

export const AccountabilityManagement = () => {
  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title="Quản lý giải trình ca" />
      </div>
      <PageFilters statusOptions={statusAccountabilityOptions} />

      <ExplanationSummary />

      <div>Table</div>
    </PageContainer>
  );
};
