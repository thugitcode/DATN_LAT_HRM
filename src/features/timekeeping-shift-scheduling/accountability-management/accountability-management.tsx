import { useCallback, useMemo, useState } from 'react';
import type { Selection } from '@heroui/react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { PageFilters } from '@/components/page-filters';
import { TitlePage } from '@/components/title-page';

import { ExplanationSummary } from './components/explanation-summary';
import { statusAccountabilityOptions } from './constants/data';
import {
  useAccountabilityManagementList,
  useBulkApproveAccountability,
} from './hooks/use-approve-accountability';
import { useColumns } from './hooks/use-columns';
import type { AttendanceExplanationFilters } from './types';

export const DEFAULT_SUMMARY = {
  totalRequests: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  byType: [],
};

export const AccountabilityManagement = () => {
  const { filters } = useQueryFilter<AttendanceExplanationFilters>();
  const { departmentId, month, roomId, search, status, type, page, limit } = filters;

  const { startDate, endDate } = useMonthDateRange(month);
  const { mutate: bulkApprove, isPending: isBulkApproving } = useBulkApproveAccountability();
  const { columns } = useColumns();

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  const { data, isLoading } = useAccountabilityManagementList({
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

  const summary = useMemo(() => data?.metadata ?? DEFAULT_SUMMARY, [data]);

  const selectedIds = useMemo<string[]>(() => {
    if (selectedKeys === 'all') return (data?.data ?? []).map((row) => String(row.id));
    return [...selectedKeys].map(String);
  }, [selectedKeys, data]);

  const hasSelection = selectedIds.length > 0;

  const handleSelectionChange = useCallback((keys: Selection) => {
    setSelectedKeys(keys);
  }, []);

  const handleOpenBulkConfirm = useCallback(() => {
    setIsBulkConfirmOpen(true);
  }, []);

  const handleCloseBulkConfirm = useCallback(() => {
    if (isBulkApproving) return;
    setIsBulkConfirmOpen(false);
  }, [isBulkApproving]);

  const handleBulkApprove = useCallback(() => {
    bulkApprove(
      { ids: selectedIds },
      {
        onSuccess: () => {
          setIsBulkConfirmOpen(false);
          setSelectedKeys(new Set());
        },
        onError: () => setIsBulkConfirmOpen(false),
      },
    );
  }, [selectedIds, bulkApprove]);

  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title="Quản lý giải trình ca" />

        {hasSelection && (
          <Button color="primary" className="h-10 px-4 font-medium" onPress={handleOpenBulkConfirm}>
            Xác nhận ({selectedIds.length})
          </Button>
        )}
      </div>

      <PageFilters statusOptions={statusAccountabilityOptions} />
      <ExplanationSummary summary={summary} explanationTypes={summary.byType} />

      <DataTable
        dataSource={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        classNames={{ wrapper: 'h-[calc(100vh-424px)]' }}
        pagination={{
          current: Number(filters.page),
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          total: data?.pagination?.total,
          pageSize: Number(filters.limit),
          totalPage: data?.pagination?.totalPage,
        }}
      />

      <Modal
        isOpen={isBulkConfirmOpen}
        onClose={handleCloseBulkConfirm}
        isDismissable={!isBulkApproving}
        hideCloseButton={isBulkApproving}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <IconAlertTriangle size={20} className="text-primary" />
            <span>Xác nhận phê duyệt</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Bạn có chắc chắn muốn xác nhận{' '}
              <span className="font-semibold text-foreground">{selectedIds.length}</span> giải trình
              công đã chọn không? Hành động này không thể hoàn tác.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" isDisabled={isBulkApproving} onPress={handleCloseBulkConfirm}>
              Hủy
            </Button>
            <Button
              color="primary"
              isLoading={isBulkApproving}
              startContent={!isBulkApproving && <IconCheck size={16} />}
              onPress={handleBulkApprove}
            >
              Xác nhận
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};
