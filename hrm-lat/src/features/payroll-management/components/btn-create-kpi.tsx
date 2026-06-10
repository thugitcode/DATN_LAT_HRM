import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';

export const BtnCreateKpi = ({ drawerType }: { drawerType?: DrawerType }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const onOpenDrawer = useDrawer((state) => state.onOpen);

  const onCreate = () => {
    onOpenDrawer(drawerType ?? DrawerType.CREATE_KPI);
  };

  return (
    <Button onPress={onCreate} color="primary" className="h-10 px-4">
      {icons.plus}
      {t('button.addNew')}
    </Button>
  );
};

BtnCreateKpi.displayName = 'BtnCreateKpi';
