import { useCallback, type FC } from 'react';
import { useConfirmStore } from '@/store/useConfirmStore';
import { DrawerType, useDrawer } from '@/store/useDrawer';

import { icons } from '@/lib/icons';
import { ActionButton } from '@/components/action-button';

import type { Kpi } from '../types/kpi.type';

interface RowKpiActionsProps {
  dataRow?: Kpi;
}

export const RowKpiActions: FC<RowKpiActionsProps> = ({ dataRow }) => {
  const { onOpen } = useDrawer((state) => state);
  const open = useConfirmStore((state) => state.open);

  const handleEdit = useCallback(() => {
    onOpen(DrawerType.CREATE_KPI, dataRow);
  }, [dataRow, onOpen]);

  //   const handleDelete = () => {
  //     open(
  //       {
  //         title: t('leave_request.actions.approve_title'),
  //         description: t('leave_request.actions.approve_desc', { name: dataRow?.staffName }),
  //         confirmLabel: t('leave_request.actions.approve'),
  //         confirmColor: 'primary',
  //         requireReason: false,
  //       },
  //     //   (reason) => handleConfirmAction(reason, 'approve'),
  //     );
  //   };

  return (
    <ActionButton className="bg-white" tooltip="Chỉnh sửa" ariaLabel="edit" onPress={handleEdit}>
      {icons.pen}
    </ActionButton>
  );

  // return (
  //   <div className="flex items-center gap-1">
  //     <ActionButton className="bg-white" tooltip="Chỉnh sửa" ariaLabel="edit" onPress={handleEdit}>
  //       {icons.pen}
  //     </ActionButton>
  //     <ActionButton className="bg-white" tooltip="Xóa" ariaLabel="delete" onPress={() => {}}>
  //       {icons.bin}
  //     </ActionButton>
  //   </div>
  // );
};
