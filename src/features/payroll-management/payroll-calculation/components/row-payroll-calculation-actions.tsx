import { useCallback, useMemo, type FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button } from '@heroui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { useSendPayslips } from '../../hooks/useSendPayslips';
import {
  PayslipChannelEnum,
  type SendPayslipPayload,
  type StaffPayroll,
} from '../../types/payroll-caculation.type';

interface RowPayrollCalculationActionsProps {
  dataRow?: StaffPayroll;
}

export const RowPayrollCalculationActions: FC<RowPayrollCalculationActionsProps> = ({
  dataRow,
}) => {
  const navigate = useNavigate();
  const { filters } = useQueryFilter<RequestsParams>();
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { mutate } = useSendPayslips();
  const open = useConfirmStore((state) => state.open);

  const monthQuery = dayjs(filters.month ?? undefined).format('YYYY-MM');

  const payload: SendPayslipPayload = useMemo(() => {
    return {
      month: monthQuery,
      channel: PayslipChannelEnum.APP,
      staffIds: [dataRow?.staffId as string],
    };
  }, [dataRow?.staffId, monthQuery]);

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

  const handleClickSend = useCallback(() => {
    open(
      {
        title: t('payrollCalculation.sendPayslip.title'),
        description: t('payrollCalculation.sendPayslip.descriptionStaff', { name: dataRow?.staffName }),
        confirmColor: 'primary',
        requireReason: false,
        confirmLabel: t('payrollCalculation.sendPayslip.confirmLabel'),
      },
      send,
    );
  }, [open, send, t, dataRow?.staffName]);

  if (!dataRow) return null;

  return (
    <div className="flex items-center gap-3">
      <Button color="primary" className="h-9 px-3 gap-2" onPress={handleClickSend}>
        {icons.send}
        {t('payrollCalculation.sendPayslip.buttonLabel')}
      </Button>
      <Button
        className="h-9 px-3 gap-2"
        color="primary"
        variant="bordered"
        onPress={() =>
          navigate({
            to: `/admin/payroll-management/payroll-calculation/${dataRow.payrollResultId}`,
            search: { staffId: dataRow.staffId, month: filters.month },
          })
        }
      >
        {t('attendance_data.viewDetail')}
      </Button>
    </div>
  );
};
