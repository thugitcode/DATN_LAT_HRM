import { useMemo } from 'react';
import { type ComboboxItem as SelectOption } from '@mantine/core';

import { CustomerStage } from '@/types/customer.type';

export const useCustomerStageOptions = () => {
  const options: SelectOption[] = useMemo(
    () => [
      {
        value: CustomerStage.KHACH_HANG_TIEM_NANG,
        label: 'Khách hàng tiềm năng',
      },
      {
        value: CustomerStage.DANG_CHAM_SOC,
        label: 'Đang chăm sóc',
      },
      {
        value: CustomerStage.DANG_KY_HOP_DONG,
        label: 'Đang ký hợp đồng',
      },
    ],
    [],
  );

  return { options };
};
