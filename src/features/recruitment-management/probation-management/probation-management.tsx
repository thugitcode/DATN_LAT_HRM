import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionsPage } from '@/components/actions-page';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { NAMESPACES } from '@/i18n/constants';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';

import { useDrawer } from '@/store/useDrawer';
import { ProbationFilterBar } from './components/probation-filters';
import { useProbationColumns } from './hooks/use-columns';
import { useProbationList } from './hooks/use-probation-list';
import type { ProbationFilters } from './types/probation.type';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/lib/constants';

const TABLE_CLASS_NAMES = { wrapper: 'rounded-[14px] h-[calc(100vh-275px)]' } as const;

export const ProbationManagement = () => {
  const { t: tR } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { filters } = useQueryFilter<ProbationFilters>();
  const { search, departmentId, roomId, status, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = filters;

  const { columns } = useProbationColumns();
  const { visibleColumns, handleApplyColumns } = useColumnVisibility({ columns });

  const { data, isLoading } = useProbationList({
    search,
    departmentId,
    roomId,
    status,
    page,
    limit,
  });

  const paginationConfig = useMemo(
    () => ({
      current: Number(page) || 1,
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      total: data?.pagination?.total,
      pageSize: Number(limit) || 10,
      totalPage: data?.pagination?.totalPage,
    }),
    [page, limit, data?.pagination],
  );

  return (
    <PageContainer className="space-y-3">
      <div className="flex items-center justify-between">
        <TitlePage title={tR('probation.title')} />
        <div className="flex items-center gap-2">
          <ActionsPage
          // actions={<BtnCreate onPress={() => onOpen(DrawerType.PROBATION_ACCEPT)} />} 
          />
          <ColumnVisibilityPopover
            columns={columns}
            visibleColumns={visibleColumns}
            onApply={handleApplyColumns}
          />
        </div>
      </div>

      <ProbationFilterBar />

      <DataTable
        dataSource={data?.data ?? []}
        columns={columns}
        selectionMode="single"
        classNames={TABLE_CLASS_NAMES}
        visibleColumns={visibleColumns}
        loading={isLoading}
        pagination={paginationConfig}
      />
    </PageContainer>
  );
};
