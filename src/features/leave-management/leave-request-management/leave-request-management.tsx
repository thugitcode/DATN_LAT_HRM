import { useState } from 'react';
import { Button, Checkbox, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@heroui/react';

import { icons } from '@/lib/icons';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { PageFilter } from '@/components/page-filter';
import { StatusSummaryItem } from '@/components/status-summary-tabs/status-summary-item';
import { StatusSummaryTabs } from '@/components/status-summary-tabs/status-summary-tabs';
import { TitlePage } from '@/components/title-page';

import { useColumns } from './hooks/use-columns';
import { useLeaveRequestManagementList } from './hooks/use-leave-request';
import type { LeaveRequestManagementFilters, MetadataLeaveRequest } from './type';

type SummaryKey = keyof MetadataLeaveRequest;

interface SummaryBadgeConfig {
  key: SummaryKey;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const SUMMARY_BADGES: SummaryBadgeConfig[] = [
  {
    key: 'totalAll',
    icon: icons.questionCircle,
    label: 'Tổng yêu cầu',
    color: '#006FEE',
    bgColor: '#E6F1FE',
  },
  {
    key: 'totalApproved',
    icon: <icons.tickCircle />,
    label: 'Đã duyệt',
    color: '#17C964',
    bgColor: '#E8FAF0',
  },
  {
    key: 'totalRejected',
    icon: <icons.closeSquare />,
    label: 'Từ chối',
    color: '#F31260',
    bgColor: '#FEE7EF',
  },
  {
    key: 'totalPending',
    icon: <icons.refreshCircle />,
    label: 'Chờ duyệt',
    color: '#F5A524',
    bgColor: '#FEF4E6',
  },
];

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-400px)]' } as const;

const VerticalDivider = () => <div className="w-px h-10 bg-[#E4E4E7] shrink-0" />;

export const LeaveRequestManagement = () => {
  const { filters } = useQueryFilter<LeaveRequestManagementFilters>();
  const { departmentId, month, roomId, search, status, type, page, limit } = filters;

  const { columns } = useColumns();
  const { startDate, endDate } = useMonthDateRange(month);

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(columns.map((col) => col.key)),
  );

  const { data, isLoading } = useLeaveRequestManagementList({
    fromDate: startDate,
    toDate: endDate,
    departmentId,
    roomId,
    search,
    status,
    type,
    page,
    limit,
  });

  const summary = data?.metadata;
  const pagination = data?.pagination;

  const handleApplyColumns = (visibleKeys: Set<string>, saveAsDefault: boolean) => {
    setVisibleColumns(visibleKeys);
  };

  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title="Quản lý đăng ký nghỉ" />

        <ColumnVisibilityPopover
          columns={columns}
          visibleColumns={visibleColumns}
          onApply={handleApplyColumns}
        />
      </div>

      <PageFilter />

      <StatusSummaryTabs className="flex flex-wrap items-center gap-4">
        {SUMMARY_BADGES.map(({ key, icon, label, color, bgColor }, index) => (
          <div key={key} className="flex items-center gap-4">
            {index !== 0 && <VerticalDivider />}
            <StatusSummaryItem
              icon={icon}
              label={label}
              count={summary?.[key]}
              color={color}
              bgColor={bgColor}
              className="flex-row items-center! gap-2"
            />
          </div>
        ))}
      </StatusSummaryTabs>

      <DataTable
        dataSource={data?.data ?? []}
        columns={columns}
        selectionMode="single"
        loading={isLoading}
        classNames={TABLE_CLASS_NAMES}
        visibleColumns={visibleColumns}
        pagination={{
          current: Number(page),
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          total: pagination?.total,
          pageSize: Number(limit),
          totalPage: pagination?.totalPage,
        }}
      />
    </PageContainer>
  );
};
