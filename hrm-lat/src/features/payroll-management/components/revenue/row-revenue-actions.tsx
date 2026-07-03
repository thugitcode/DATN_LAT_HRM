import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useState } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';
import { ConfirmModal } from '@/components/confirm-modal/confirm-modal';
import { useDeleteRevenueManagement, useUpdateRevenueManagement } from '../../hooks/use-revenue-management';
import { Status } from '@/types/global.type';

import { icons } from '@/lib/icons';
import type { RevenueDataListType } from '../../types/revenue.type';

interface RowRevenueActionsProps {
  dataRow?: RevenueDataListType;
}

export const RowRevenueActions: FC<RowRevenueActionsProps> = ({ dataRow }) => {
  const { onOpen } = useDrawer((state) => state);
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const { mutate: deleteRevenue, isPending, isLoading } = useDeleteRevenueManagement() as any;
  const { mutate: updateRevenue, isPending: isApproving } = useUpdateRevenueManagement();
  const isDeleting = isPending || isLoading;

  const handleDelete = () => {
    if (dataRow?.id) {
      deleteRevenue(dataRow.id, {
        onSuccess: () => setIsConfirmOpen(false),
      });
    }
  };

  const handleApprove = () => {
    if (!dataRow?.id) return;
    updateRevenue(
      {
        id: dataRow.id,
        data: {
          targetAmount: dataRow.targetAmount,
          actualAmount: dataRow.actualAmount,
          achievementRate: dataRow.achievementRate,
          status: Status.CONFIRMED,
        } as any,
      },
      { onSuccess: () => setIsApproveOpen(false) },
    );
  };

  return (
    <>
      <div className='flex'>
        <Button
          // color="primary"
          variant="light"
          onPress={() => onOpen(DrawerType.REVENUE_DETAILS, dataRow)}
          isIconOnly
        >
          <icons.edit className='size-5' />
        </Button>
        {dataRow?.status !== Status.CONFIRMED && (
          <Button
            variant="light"
            onPress={() => setIsApproveOpen(true)}
            isIconOnly
          >
            <icons.tickCircle className='size-5' />
          </Button>
        )}
        <Button
          // color="primary"
          variant="light"
          onPress={() => setIsConfirmOpen(true)}
          isIconOnly
        >
          <icons.trash className='size-5' />
        </Button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        reason=""
        onReasonChange={() => { }}
        config={{
          title: t('revenue.delete_confirm.title', 'Xóa doanh thu'),
          description: t('revenue.delete_confirm.description', 'Bạn có chắc chắn muốn xóa doanh thu này không? Hành động này không thể hoàn tác.'),
          confirmLabel: t('revenue.delete_confirm.confirm', 'Xóa'),
          confirmColor: 'danger',
          requireReason: false,
        }}
      />

      <ConfirmModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        isLoading={isApproving}
        reason=""
        onReasonChange={() => { }}
        config={{
          title: 'Duyệt doanh thu',
          description: `Xác nhận duyệt doanh thu tháng ${dataRow?.month} của ${dataRow?.staff?.name || 'nhân viên này'}? Sau khi duyệt, doanh thu sẽ được tính vào lương.`,
          confirmLabel: 'Duyệt',
          confirmColor: 'primary',
          requireReason: false,
        }}
      />
    </>
  );
};