'use client';

import { useDrawer } from '@/store/useDrawer';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@heroui/react';

import { cn } from '@/lib/utils';

import { useDrawerConfig } from './drawer.config';

export function MainDrawer() {
  const { isOpen, type, onClose } = useDrawer((state) => state);
  const drawerConfig = useDrawerConfig();

  if (!type) return null;

  const config = drawerConfig[type];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton={!config.title}
      {...config.drawerProps}
      classNames={{
        ...config.classNames,
        closeButton: 'top-5 right-5 hover:bg-gray-100 z-50',
      }}
      className="rounded-none"
    >
      <DrawerContent>
        {(onClose) => (
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
