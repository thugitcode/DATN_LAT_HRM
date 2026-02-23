'use client';

import { useDrawer } from '@/store/useDrawer';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@heroui/react';

import { DRAWER_CONFIG } from './drawer.config';

export function MainDrawer() {
  const { isOpen, type, onClose } = useDrawer((state) => state);

  if (!type) return null;

  const config = DRAWER_CONFIG[type];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      {...config.drawerProps}
      classNames={config.classNames}
      className="rounded-none"
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="px-6 pt-6 pb-3 text-[30px] leading-9 font-semibold">
              {config.title}
            </DrawerHeader>
            <DrawerBody className="bg-[#F4F4F5] px-0 pt-0 pb-0">{config.component}</DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
