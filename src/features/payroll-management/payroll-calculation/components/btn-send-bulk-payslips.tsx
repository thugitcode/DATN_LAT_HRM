import { useCallback, useMemo, type FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button } from '@heroui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';

import { useSendPayslips } from '../../hooks/useSendPayslips';
import { PayslipChannelEnum, type SendPayslipPayload } from '../../types/payroll-caculation.type';

interface BtnSendBulkPayslips {
  month?: string;
}

export const BtnSendBulkPayslips: FC<BtnSendBulkPayslips> = ({ month }) => {
  const { mutate, isPending } = useSendPayslips();
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
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
        title: t('payrollCalculation.sendPayslip.title'),
        description: t('payrollCalculation.sendPayslip.description'),
        confirmColor: 'primary',
        requireReason: false,
        confirmLabel: t('payrollCalculation.sendPayslip.confirmLabel'),
      },
      send,
    );
  }, [open, send, t]);

  return (
    <Button color="primary" className="h-10 px-4" isLoading={isPending} onPress={handleSendBulk}>
      {icons.send}
      {t('payrollCalculation.sendPayslip.bulkButtonLabel')}
    </Button>
  );
};
