import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';
import { RightMenuDivider } from './right-menu-divider';
import { RightMenuItem } from './right-menu-item';
import { IconHrm, IconCategory } from './right-menu-icons';
import { Tooltip } from '@heroui/react';

export const urlKeys = {
  CIS_WEB_UI_URL: "CIS_WEB_UI_URL",
  LIS_WEB_UI_URL: "LIS_WEB_UI_URL",
  DM_WEB_UI_URL: "DM_WEB_UI_URL",
  RP_WEB_UI_URL: "RP_WEB_UI_URL",
  PRM_WEB_UI_URL: "PRM_WEB_UI_URL",
  SUPPLIES_WEB_UI_URL: "SUPPLIES_WEB_UI_URL",
  PHR_WEB_UI_URL: "PHR_WEB_UI_URL",
};

export const RightMenu = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);

  const items = [
    {
      key: 'hrm',
      label: t('right_menu.home'),
      tooltip: t('right_menu.home'),
      icon: <IconHrm />,
      href: window.location.origin,
      active: true,
    },
    {
      key: 'categories',
      label: t('Danh mục' as any),
      tooltip: t('Danh mục' as any),
      icon: <IconCategory />,
      href: '/hrm-categories',
      active: window?.location?.pathname?.includes('/hrm-categories'),
    },
  ] as any[];

  return (
    <div className="flex flex-col items-center w-[90px] bg-white shadow-[0_1px_3px_0_#0000001A]">
      {items.map((item, idx) => {
        if (item.type === 'divider') {
          return <RightMenuDivider key={idx} />;
        }
        return (
          <Tooltip key={item.key} content={item.tooltip} placement="left">
            <RightMenuItem
              label={item.label}
              icon={item.icon}
              href={item.href!}
              active={item.active}
            />
          </Tooltip>
        );
      })}
    </div>
  );
};