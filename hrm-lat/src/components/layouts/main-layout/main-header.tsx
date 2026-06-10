import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_OPTIONS } from '@/i18n/constants';
import { cn } from '@/lib/utils';

import { MainHeaderNav } from './main-header-nav';
import { useMenuSidebar } from './main-sidebar/use-menu-sidebar';

export const MainHeader = () => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const { activeMenu } = useMenuSidebar()
  return (
    <div className="bg-white text-primary min-h-20 h-20 flex items-center ps-6 pe-5 py-3 border-b border-white/5 relative">
      <div className="flex justify-start">
        {/* <MainLogo /> */}
        <h1 className="max-xl:hidden text-2xl text-[#2C3782] font-medium">{activeMenu?.label}</h1>
      </div>

      <div className="flex justify-center flex-1">
        <MainHeaderNav />
      </div>

      <div className="flex justify-end items-center gap-x-3">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              className="size-10 cursor-pointer hover:opacity-80 transition-opacity"
              src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            />
          </DropdownTrigger>

          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile">{t('header.my_profile')}</DropdownItem>
            <DropdownItem key="settings">{t('header.settings')}</DropdownItem>

            <DropdownItem
              key="language"
              isReadOnly
              className="p-0 bg-transparent"
              textValue={t('header.language')}
            >
              <div
                onMouseEnter={() => setLangOpen(true)}
                onMouseLeave={() => setLangOpen(false)}
              >
                <div className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-default-100 cursor-default">
                  <span className="text-sm">{t('header.language')}</span>
                  <IconChevronRight size={14} className="text-default-400" />
                </div>

                {langOpen && (
                  <div className="fixed left-[-150px] top-[70px] w-40 rounded-xl bg-white shadow-lg border border-default-200 p-1 z-9999">
                    {LANGUAGE_OPTIONS.map(({ code, flag, label }) => (
                      <button
                        key={code}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-default-100 transition-colors',
                          i18n.language === code ? 'text-primary font-medium' : 'text-default-700',
                        )}
                        onClick={() => i18n.changeLanguage(code)}
                      >
                        <span className="text-base leading-none">{flag}</span>
                        <span className="flex-1 text-left">{label}</span>
                        {i18n.language === code && <IconCheck size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DropdownItem>

            <DropdownItem
              key="logout"
              color="danger"
              closeOnSelect={true}
              onClick={() => { }}
            >
              {t('header.logout')}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};
