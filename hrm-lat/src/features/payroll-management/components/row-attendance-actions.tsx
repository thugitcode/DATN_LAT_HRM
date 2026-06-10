import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import type { StaffTimeKeeping } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

interface RowAttendanceActionsProps {
  dataRow?: StaffTimeKeeping;
}

export const RowAttendanceActions: FC<RowAttendanceActionsProps> = ({ dataRow }) => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const { onOpen } = useDrawer((state) => state);

  return (
    <Button
      color="primary"
      variant="bordered"
      onPress={() => onOpen(DrawerType.TIMEKEEPING_DETAILS, dataRow?.id)}
      className='border-1'
    >
      {t('attendance_data.viewDetail')}
    </Button>
  );
};
