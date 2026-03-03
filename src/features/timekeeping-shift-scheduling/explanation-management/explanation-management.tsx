import { useEffect, useMemo, useState } from 'react';
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';

import type { AttendanceExplanationFilters } from '@/types/attendance-explanation.type';
import { normalizeAxiosError } from '@/lib/axios';
import { useCommonTable } from '@/hooks/common/use-common-table';
import {
  attendanceExplanationListQueryOptions,
  useApproveAttendanceExplanation,
  useBulkApproveAttendanceExplanation,
  useRejectAttendanceExplanation,
} from '@/hooks/use-attendance-explanation';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { ExplanationFilter } from './components/explanation-filter';
import { ExplanationSummaryCard } from './components/explanation-summary';
import { ExplanationTable } from './components/explanation-table';

const RejectModal = ({
  rejectId,
  onClose,
  onSuccess,
}: {
  rejectId: string | null;
  onClose: () => void;
  onSuccess: (id: string) => void;
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const { mutateAsync: rejectMutate, isPending: isRejecting } = useRejectAttendanceExplanation();

  useEffect(() => {
    if (rejectId) {
      setRejectReason('');
    }
  }, [rejectId]);

  const confirmReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    try {
      await rejectMutate({ id: rejectId, reason: rejectReason.trim() });
      addToast({ title: 'Từ chối giải trình thành công', color: 'success' });
      onSuccess(rejectId);
      onClose();
    } catch (error) {
      addToast({ title: normalizeAxiosError(error).message, color: 'danger' });
    }
  };

  return (
    <Modal isOpen={!!rejectId} onOpenChange={onClose}>
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Từ chối giải trình</ModalHeader>
            <ModalBody>
              <Textarea
                label="Lý do từ chối"
                placeholder="Nhập lý do từ chối giải trình..."
                value={rejectReason}
                onValueChange={setRejectReason}
                isRequired
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onCloseModal}
                isDisabled={isRejecting}
              >
                Hủy
              </Button>
              <Button
                color="primary"
                onPress={confirmReject}
                isLoading={isRejecting}
                isDisabled={!rejectReason.trim()}
              >
                Xác nhận từ chối
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export const ExplanationManagement = () => {
  const [filters, setFilters] = useState<AttendanceExplanationFilters>({
    fromDate: undefined,
    toDate: undefined,
  });

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [isBulkApproveModalOpen, setIsBulkApproveModalOpen] = useState(false);

  const table = useCommonTable({
    // @ts-expect-error type inference
    queryOptions: attendanceExplanationListQueryOptions,
    defaultFilters: filters,
    defaultPagination: {
      page: 1,
      limit: 10,
    },
  });

  const { mutateAsync: approveMutate } = useApproveAttendanceExplanation();
  const { mutateAsync: bulkApproveMutate, isPending: isBulkApproving } =
    useBulkApproveAttendanceExplanation();

  const summary = useMemo(() => {
    return (
      table.meta || {
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        byType: [],
      }
    );
  }, [table.meta]);

  const handleFiltersChange = (newFilters: AttendanceExplanationFilters) => {
    setFilters(newFilters);
    table.onFilters(newFilters);
  };

  const handleBulkApprove = async () => {
    if (!table.selectedRecords.length) return;
    const ids = table.selectedRecords.map((r) => r.id);
    try {
      await bulkApproveMutate({ ids });
      addToast({ title: 'Xác nhận giải trình thành công', color: 'success' });
      table.setSelectedRecords([]);
      setIsBulkApproveModalOpen(false);
    } catch (error) {
      addToast({ title: normalizeAxiosError(error).message, color: 'danger' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutate({ id });
      addToast({ title: 'Xác nhận giải trình thành công', color: 'success' });
      table.setSelectedRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      addToast({ title: normalizeAxiosError(error).message, color: 'danger' });
    }
  };

  const handleReject = (id: string) => {
    setRejectId(id);
  };

  const handleRejectSuccess = (id: string) => {
    table.setSelectedRecords((prev) => prev.filter((r) => r.id !== id));
  };
  
  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <TitlePage title="Quản lý giải trình ca" />
        <Button
          color="primary"
          className="h-10 px-4 font-medium"
          isDisabled={table.selectedRecords.length === 0}
          onPress={() => setIsBulkApproveModalOpen(true)}
        >
          Xác nhận
        </Button>
      </div>

      {/* Filters */}
      <ExplanationFilter filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Summary */}
      <ExplanationSummaryCard summary={summary} explanationTypes={summary.byType} />

      {/* Table */}
      <ExplanationTable
        data={table.data}
        page={table.page}
        limit={table.limit}
        total={table.total}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        selectedRecords={table.selectedRecords}
        onSelectionChange={table.setSelectedRecords}
        onRefresh={table.refetch}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <RejectModal
        rejectId={rejectId}
        onClose={() => setRejectId(null)}
        onSuccess={handleRejectSuccess}
      />

      <Modal isOpen={isBulkApproveModalOpen} onOpenChange={setIsBulkApproveModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Xác nhận hàng loạt</ModalHeader>
              <ModalBody>
                <p>
                  Bạn có chắc chắn muốn duyệt {table.selectedRecords.length} giải trình ca đã chọn
                  không?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isBulkApproving}
                >
                  Hủy
                </Button>
                <Button color="primary" onPress={handleBulkApprove} isLoading={isBulkApproving}>
                  Xác nhận
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};
