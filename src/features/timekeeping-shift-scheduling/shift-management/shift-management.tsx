import { ActionsPage } from '@/components/actions-page';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { ShiftManagementFilter } from './components/shift-management-filter';

export const ShiftManagement = () => {
  return (
    <PageContainer className="space-y-4">
      <div className="flex items-center justify-between">
        <TitlePage title="Quản lý phân ca" />

        <ActionsPage />
      </div>

      <ShiftManagementFilter />
      <div>Table</div>
    </PageContainer>
  );
};
