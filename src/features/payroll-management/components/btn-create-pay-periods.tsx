import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';

export const BtnCreatePayPeriods = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const onOpenDrawer = useDrawer((state) => state.onOpen);

  const onCreate = () => {
    // onOpenDrawer(drawerType ?? DrawerType.CREATE_KPI);
  };

  return (
    <Button onPress={onCreate} color="primary" className="h-10 px-4">
      {icons.plus}
      Thêm mới kỳ lương
    </Button>
  );
};

BtnCreatePayPeriods.displayName = 'BtnCreatePayPeriods';
