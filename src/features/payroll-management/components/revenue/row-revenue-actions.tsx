import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import type { FC } from 'react';

import { icons } from '@/lib/icons';
import type { RevenueDataListType } from '../../types/revenue.type';

interface RowRevenueActionsProps {
  dataRow?: RevenueDataListType;
}

export const RowRevenueActions: FC<RowRevenueActionsProps> = ({ dataRow }) => {

  const { onOpen } = useDrawer((state) => state);

  return (
    <div className='flex gap-2'>
      <Button
        // color="primary"
        variant="light"
        onPress={() => onOpen(DrawerType.TIMEKEEPING_DETAILS, dataRow?.id)}
        isIconOnly
      >
        <icons.edit className='size-5'/>
      </Button>
      <Button
        // color="primary"
        variant="light"
        onPress={() => onOpen(DrawerType.TIMEKEEPING_DETAILS, dataRow?.id)}
        isIconOnly
      >
        <icons.trash className='size-5'/>
      </Button>

    </div>
  );
};
