import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/react';

import { LayoutSwitcherEnum } from '@/types/global.type';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';
import { useCurrentLayout } from '@/features/timekeeping-shift-scheduling/hooks/use-current-layout';
import { ControlMode, useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { icons } from '@/lib/icons';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { DrawerType, useDrawer } from '@/store/useDrawer';

import { RecruitmentRequestFilterBar } from './components/recruitment-request-filters';
import { RecruitmentRequestGrid } from './components/recruitment-request-grid';
import { SummaryBadges } from './components/summary-badges';
import { useColumns } from './hooks/use-columns';
import { useRecruitmentRequestList, useRecruitmentRequestSummary } from './hooks/use-recruitment-request';
import type { RecruitmentRequestFilters } from './types/type';
import { DEFAULT_SUMMARY } from './constants/data';

const TABLE_CLASS_NAMES = { wrapper: 'rounded-[14px] h-[calc(100vh-396px)]' } as const;

export const RecruitmentRequestList = () => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const navigate = useNavigate();
  const currentLayout = useCurrentLayout();
  const isGridView = currentLayout === LayoutSwitcherEnum.GRID;

  const { filters, setFilters } = useQueryFilter<RecruitmentRequestFilters>();
  const { departmentId, month, roomId, search, status, page, limit } = filters;

  const { columns } = useColumns();
  const { startDate, endDate } = useMonthDateRange(month);

  const { visibleColumns, handleApplyColumns } = useColumnVisibility({ columns });

  const { data, isLoading } = useRecruitmentRequestList({
    fromDate: startDate,
    toDate: endDate,
    departmentId,
    roomId,
    search,
    status,
    page,
    limit,
  });
  const { data: summary } = useRecruitmentRequestSummary();

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

  const { onOpen } = useDrawer();
  const { setMode } = useControlMode();
  const handleAdd = () => {
    setMode(ControlMode.create);
    onOpen(DrawerType.RECRUITMENT_REQUEST_MUTATE);
  };

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
          <Button color="primary" onPress={handleAdd}>
            {icons.plus}
            {t('recruitment_request.add')}
          </Button>
        </div>
      </div>

      <SummaryBadges summary={summary?.data ?? DEFAULT_SUMMARY} />

      <RecruitmentRequestFilterBar />

      <LayoutRenderer
        layouts={{
          [LayoutSwitcherEnum.LIST]: {
            component: DataTable,
            props: {
              dataSource: data?.data ?? [],
              columns,
              selectionMode: 'single',
              classNames: TABLE_CLASS_NAMES,
              visibleColumns,
              onRowClick: (row: { id: string }) =>
                navigate({ to: `/admin/recruitment-management/recruitment-request/${row.id}` }),
              loading: isLoading,
              pagination: paginationConfig,
            },
          },
          [LayoutSwitcherEnum.GRID]: {
            component: RecruitmentRequestGrid,
            props: {
              data: data?.data ?? [],
              isLoading,
              page: Number(page) || 1,
              limit: Number(limit) || 12,
              total: data?.pagination?.total ?? 0,
              onPageChange: (p: number) => setFilters({ page: String(p) }),
              onLimitChange: (l: number) => setFilters({ limit: String(l), page: '1' }),
            },
          },
        }}
      />
    </PageContainer>
  );
};
