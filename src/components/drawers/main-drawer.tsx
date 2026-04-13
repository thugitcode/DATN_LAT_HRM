'use client';

import { useDrawer } from '@/store/useDrawer';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { cn } from '@/lib/utils';

import { useDrawerConfig } from './drawer.config';

export function MainDrawer() {
  const { isOpen, type, onClose, isDirty } = useDrawer((state) => state);
  const openConfirm = useConfirmStore((s) => s.open);
  const drawerConfig = useDrawerConfig();
  const { t } = useTranslation(NAMESPACES.COMMON);

  if (!type) return null;

  const config = drawerConfig[type];

  const handleCloseAttempt = () => {
    if (isDirty) {
      openConfirm(
        {
          title: t('drawer.confirm_close.title'),
          description: t('drawer.confirm_close.description'),
          confirmLabel: t('drawer.confirm_close.confirm'),
          confirmColor: 'danger',
        },
        async () => onClose(),
      );
    } else {
      onClose();
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) handleCloseAttempt(); }}
      hideCloseButton={!config.title}
      {...config.drawerProps}
      classNames={{
        ...config.classNames,
        closeButton: 'top-5 right-5 hover:bg-gray-100 z-50',
      }}
      className="rounded-none"
    >
      <DrawerContent>
        {() => (
          <>
            {config.title && (
              <DrawerHeader
                className={cn(
                  'flex items-center px-6 py-5 text-[22px] font-bold text-gray-900',
                  config.classNames?.header,
                )}
              >
                {config.title}
              </DrawerHeader>
            )}

            <DrawerBody className="bg-[#F4F4F5] px-0 py-0">{config.component}</DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
