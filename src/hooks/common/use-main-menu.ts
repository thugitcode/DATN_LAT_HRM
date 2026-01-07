import type { MainMenuItem } from '@/types';
import { mainMenuKeys } from '@/lib/constants';

export const useMainMenu = () => {
  const menu: MainMenuItem[] = [
    {
      key: mainMenuKeys.DASHBOARD,
      label: 'Bảng điều khiển',
      icon: 'category',
      link: '/admin/dashboard',
    },
  ];

  return {
    menu,
  };
};
