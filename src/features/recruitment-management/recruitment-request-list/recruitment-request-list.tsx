// import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useLayoutStore } from '@/store/useLayoutStore';

import { LayoutSwitcherEnum } from '@/types/global.type';
// import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
// import { useMonthDateRange } from '@/hooks/use-month-date-range';
// import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { RecruitmentRequestFilterBar } from './components/recruitment-request-filters';
import { RecruitmentRequestGrid } from './components/recruitment-request-grid';
import { SummaryBadges } from './components/summary-badges';
import { MOCK_METADATA, MOCK_RECRUITMENT_REQUESTS } from './constants/mock-data';
import { useColumns } from './hooks/use-columns';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import type { RecruitmentRequestFilters } from './types/type';
import { useRecruitmentRequestList } from './hooks/use-recruitment-request';
import { useMemo } from 'react';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { Button } from '@heroui/react';
import { icons } from '@/lib/icons';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { ControlMode, useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
// import { useRecruitmentRequestList } from './hooks/use-recruitment-request';
// import type { RecruitmentRequestFilters } from './type';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-420px)]' } as const;

export const RecruitmentRequestList = () => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const navigate = useNavigate()
  const { pathname = '/' } = useLocation();
  const { getLayout } = useLayoutStore();
  const currentLayout = getLayout(pathname);
  const isGridView = currentLayout === LayoutSwitcherEnum.GRID;

  const { filters } = useQueryFilter<RecruitmentRequestFilters>();
  const { departmentId, month, roomId, search, status, page, limit, departmentIds, roomIds } =
    filters;

  const { columns } = useColumns();
  const { startDate, endDate } = useMonthDateRange(month);

  const { visibleColumns, handleApplyColumns } = useColumnVisibility({
    columns,
  });

  // TODO: Bật lại khi có API
  const { data, isLoading } = useRecruitmentRequestList({
    fromDate: startDate,
    toDate: endDate,
    departmentId,
    roomId,
    search,
    status,
    page,
    limit,
    departmentIds,
    roomIds,
  });

  const paginationConfig = useMemo(
    () => ({
      current: Number(page),
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      total: data?.pagination?.total,
      pageSize: Number(limit),
      totalPage: data?.pagination?.totalPage,
    }),
    [page, limit, data?.pagination],
  );
  const { onOpen } = useDrawer()
  const { setMode } = useControlMode()
  const handleAdd = () => {
    setMode(ControlMode.create)
    onOpen(DrawerType.RECRUITMENT_REQUEST_MUTATE)
  }
  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title={t('recruitment_request.title')} />

        <div className="flex items-center gap-2">
          <ActionsPage />
          {!isGridView && (
            <ColumnVisibilityPopover
              columns={columns}
              visibleColumns={visibleColumns}
              onApply={handleApplyColumns}
            />
          )}
          <Button color='primary' onPress={handleAdd}>
            {icons.plus}
            {t('recruitment_request.add')}
          </Button>
        </div>
      </div>

      <SummaryBadges summary={MOCK_METADATA} />

      <RecruitmentRequestFilterBar />

      {isGridView ? (
        <RecruitmentRequestGrid data={MOCK_RECRUITMENT_REQUESTS} />
      ) : (
        <DataTable
          dataSource={data?.data ?? []}
          columns={columns}
          selectionMode="single"
          classNames={TABLE_CLASS_NAMES}
          visibleColumns={visibleColumns}
          onRowClick={(row) => navigate({ to: `/admin/recruitment-management/recruitment-request/${row.id}` })}
          // TODO: Bật lại khi có API
          loading={isLoading}
          pagination={paginationConfig}
        />
      )}
    </PageContainer>
  );
};
