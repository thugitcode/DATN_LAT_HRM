import { useCallback, type FC } from 'react';
import { useConfirmStore } from '@/store/useConfirmStore';
import { DrawerType, useDrawer } from '@/store/useDrawer';

import { icons } from '@/lib/icons';
import { ActionButton } from '@/components/action-button';

import type { Kpi } from '../types/kpi.type';
import { Status } from '@/types/global.type';
import { useUpdateKPIManagement } from '../hooks/use-payroll-management';

interface RowKpiActionsProps {
  dataRow?: Kpi;
}

export const RowKpiActions: FC<RowKpiActionsProps> = ({ dataRow }) => {
  const { onOpen } = useDrawer((state) => state);
  const open = useConfirmStore((state) => state.open);
  const { mutate: updateKpi, isPending } = useUpdateKPIManagement();

  const handleEdit = useCallback(() => {
    onOpen(DrawerType.CREATE_KPI, dataRow);
  }, [dataRow, onOpen]);

  const handleApprove = useCallback(() => {
    if (!dataRow?.id) return;
    open(
      {
        title: 'Duyệt KPI',
        description: `Xác nhận duyệt KPI tháng ${dataRow.month} của ${dataRow.staff?.name || 'nhân viên này'}? Sau khi duyệt, KPI sẽ được tính vào lương.`,
        confirmLabel: 'Duyệt',
        confirmColor: 'primary',
        requireReason: false,
      },
      async () => {
        updateKpi({
          id: dataRow.id,
          payload: {
            staffId: dataRow.staff?.id,
            month: dataRow.month,
            kpiScore: dataRow.kpiScore,
            rating: dataRow.rating,
            evaluatorId: dataRow.evaluator?.id,
            source: dataRow.source,
            status: Status.CONFIRMED,
          } as any,
        });
      },
    );
  }, [dataRow, open, updateKpi]);

  return (
    <div className="flex items-center gap-1">
      <ActionButton className="bg-white" tooltip="Chỉnh sửa" ariaLabel="edit" onPress={handleEdit}>
        {icons.pen}
      </ActionButton>
      {dataRow?.status !== Status.CONFIRMED && (
        <ActionButton
          className="bg-white"
          tooltip="Duyệt KPI"
          ariaLabel="approve"
          onPress={handleApprove}
          isDisabled={isPending}
        >
          <icons.tickCircle />
        </ActionButton>
      )}
    </div>
  );
};