import { useCallback, useMemo, type FC } from 'react';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button } from '@heroui/react';
import dayjs from 'dayjs';

import { icons } from '@/lib/icons';

import { useSendPayslips } from '../../hooks/useSendPayslips';
import { PayslipChannelEnum, type SendPayslipPayload } from '../../types/payroll-caculation.type';

interface BtnSendBulkPayslips {
  month?: string;
}

export const BtnSendBulkPayslips: FC<BtnSendBulkPayslips> = ({ month }) => {
  const { mutate, isPending } = useSendPayslips();
  const open = useConfirmStore((state) => state.open);
  const monthQuery = dayjs(month ?? undefined).format('YYYY-MM');

  const payload: SendPayslipPayload = useMemo(() => {
    return {
      month: monthQuery,
      channel: PayslipChannelEnum.APP,
    };
  }, [monthQuery]);

  const send = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        mutate(payload, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      }),
    [payload, mutate],
  );

  const handleSendBulk = useCallback(() => {
    open(
      {
        title: 'Gửi phiếu lương hàng loạt',
        description: 'Bạn có chắc muốn gửi phiếu lương cho tất cả nhân viên không?',
        confirmColor: 'primary',
        requireReason: false,
        confirmLabel: 'Xác nhận',
      },
      send,
    );
  }, [open, send]);

  return (
    <Button color="primary" className="h-10 px-4" isLoading={isPending} onPress={handleSendBulk}>
      {icons.send}
      Gửi phiếu lương hàng loạt
    </Button>
  );
};
