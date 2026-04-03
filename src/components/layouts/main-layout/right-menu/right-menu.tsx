import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';
import { apiTokens } from '@/lib/axios';
import { RightMenuDivider } from './right-menu-divider';
import { RightMenuItem } from './right-menu-item';
import {
  IconCis,
  IconHrm,
  IconLis,
  IconRis,
  IconPrm,
  IconVatTu,
  IconKhamDoan,
  IconBaoCao,
  IconQlBenhNhan,
} from './right-menu-icons';
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

const w = window as any;

export const RightMenu = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { accessToken, refreshToken } = apiTokens;

  const cisUrl = window.CIS_WEB_UI_URL ?? '';

  const items = [
    {
      key: 'hrm',
      label: t('right_menu.home'),
      tooltip: t('right_menu.home'),
      icon: <IconHrm />,
      href: window.location.origin,
      active: true,
    },
    // { type: 'divider' as const },
    {
      key: 'cis',
      label: t('right_menu.cis_label'),
      tooltip: t('right_menu.cis'),
      icon: <IconCis />,
      href: cisUrl,
    },
    // { type: 'divider' as const },
    {
      key: 'lis',
      label: t('right_menu.lis_label'),
      tooltip: t('right_menu.lis'),
      icon: <IconLis />,
      href: `${w?.[urlKeys.LIS_WEB_UI_URL]}?access_token=${accessToken}&refresh_token=${refreshToken}`,
    },
    // { type: 'divider' as const },
    {
      key: 'ris',
      label: t('right_menu.ris_label'),
      tooltip: t('right_menu.ris'),
      icon: <IconRis />,
      href: `${cisUrl}ris`,
    },
    // { type: 'divider' as const },
    {
      key: 'prm',
      label: t('right_menu.prm_label'),
      tooltip: t('right_menu.prm'),
      icon: <IconPrm />,
      href: `${w?.[urlKeys.PRM_WEB_UI_URL]}?access_token=${accessToken}`,
    },
    // { type: 'divider' as const },
    {
      key: 'vat_tu',
      label: t('right_menu.vat_tu_label'),
      tooltip: t('right_menu.vat_tu'),
      icon: <IconVatTu />,
      href: `${w?.[urlKeys.SUPPLIES_WEB_UI_URL]}?access_token=${accessToken}&refresh_token=${refreshToken}`,
    },
    // { type: 'divider' as const },
    {
      key: 'kham_doan',
      label: t('right_menu.kham_doan_label'),
      tooltip: t('right_menu.kham_doan'),
      icon: <IconKhamDoan />,
      href: `${w?.[urlKeys.PHR_WEB_UI_URL]}?access_token=${accessToken}&refresh_token=${refreshToken}`,
    },
    // { type: 'divider' as const },
    {
      key: 'bao_cao',
      label: t('right_menu.bao_cao_label'),
      tooltip: t('right_menu.bao_cao'),
      icon: <IconBaoCao />,
      href: `${w?.[urlKeys.RP_WEB_UI_URL]}?access_token=${accessToken}&refresh_token=${refreshToken}`,
    },
    // { type: 'divider' as const },
    {
      key: 'ql_benh_nhan',
      label: t('right_menu.ql_benh_nhan_label'),
      tooltip: t('right_menu.ql_benh_nhan'),
      icon: <IconQlBenhNhan />,
      href: `${cisUrl}benh-nhan`,
    },
  ];

  return (
    <div className="flex flex-col items-center w-[72px] bg-white shadow-[0_1px_3px_0_#0000001A]">
      {items.map((item, idx) => {
        if (item.type === 'divider') {
          return <RightMenuDivider key={idx} />;
        }
        return (
          <Tooltip key={item.key} content={item.tooltip} placement="left" >
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
