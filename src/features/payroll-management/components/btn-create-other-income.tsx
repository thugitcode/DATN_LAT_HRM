import { memo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';

export const BtnCreateOtherIncome = memo(() => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const onOpenDrawer = useDrawer((state) => state.onOpen);

  const onCreate = () => {
    onOpenDrawer(DrawerType.CREATE_OTHER_INCOME);
  };

  return (
    <Button onPress={onCreate} color="primary" className="h-10 px-4">
      {icons.plus}
      {t('button.moreIncome')}
    </Button>
  );
});

BtnCreateOtherIncome.displayName = 'BtnCreateOtherIncome';
