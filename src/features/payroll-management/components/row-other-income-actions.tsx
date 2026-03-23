import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useState } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';
import { ConfirmModal } from '@/components/confirm-modal/confirm-modal';

import { icons } from '@/lib/icons';
import type { OtherIncome } from '../types/other-income.type';
import { useDeleteOtherIncomeManagement } from '../hooks/use-payroll-management';

interface RowOtherIncomeActionsProps {
  dataRow?: OtherIncome;
}

export const RowOtherIncomeActions: FC<RowOtherIncomeActionsProps> = ({ dataRow }) => {
  const { onOpen } = useDrawer((state) => state);
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutate: deleteOtherIncome, isPending, isLoading } = useDeleteOtherIncomeManagement() as any;
  const isDeleting = isPending || isLoading;

  const handleDelete = () => {
    if (dataRow?.id) {
      deleteOtherIncome(dataRow.id, {
        onSuccess: () => setIsConfirmOpen(false),
      });
    }
  };

  return (
    <>
      <div className='flex'>
        <Button
          // color="primary"
          variant="light"
          onPress={() => onOpen(DrawerType.CREATE_OTHER_INCOME, dataRow)}
          isIconOnly
        >
          <icons.edit className='size-5' />
        </Button>
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
          title: t('allowance.delete_confirm.title', 'Xóa khoản thu nhập'),
          description: t('allowance.delete_confirm.description', 'Bạn có chắc chắn muốn xóa khoản thu nhập này không? Hành động này không thể hoàn tác.'),
          confirmLabel: t('allowance.delete_confirm.confirm', 'Xóa'),
          confirmColor: 'danger',
          requireReason: false,
        }}
      />
    </>
  );
};
