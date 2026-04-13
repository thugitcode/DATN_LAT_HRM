import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import type { PayslipFeedback } from '../types/payslip-feedback.type';

interface RowPayslipActionsProps {
  dataRow?: PayslipFeedback;
}

export const RowPayslipActions: FC<RowPayslipActionsProps> = ({ dataRow }) => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const { onOpen } = useDrawer((state) => state);

  return (
    <Button
      color="primary"
      variant="bordered"
      onPress={() => onOpen(DrawerType.DETAIL_PAYSLIP_FEEDBACK, dataRow)}
      className='border-1'
    >
      {t('attendance_data.viewDetail')}
    </Button>
  );
};
