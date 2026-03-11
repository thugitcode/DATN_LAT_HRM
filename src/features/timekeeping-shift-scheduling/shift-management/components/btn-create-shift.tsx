import { memo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

export const BtnCreateShift = memo(() => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const onOpenDrawer = useDrawer((state) => state.onOpen);

  const onCreate = () => {
    onOpenDrawer(DrawerType.WORK_SHIFTS);
  };

  return (
    <Button onPress={onCreate} color="primary" className="h-10 px-4">
      {t('button.create_ca')}
    </Button>
  );
});

BtnCreateShift.displayName = 'BtnCreateShift';
