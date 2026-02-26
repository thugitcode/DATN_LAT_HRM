import { memo } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';

export const BtnCreateShift = memo(() => {
  const onOpenDrawer = useDrawer((state) => state.onOpen);

  const onCreate = () => {
    onOpenDrawer(DrawerType.WORK_SHIFTS);
  };

  return (
    <Button onPress={onCreate} color="primary" className="h-10 px-4">
      Thêm phân ca
    </Button>
  );
});

BtnCreateShift.displayName = 'BtnCreateShift';
