import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';

import { icons } from './constant/icons';
import { MainHeaderNav } from './main-header-nav';
import { MainLogo } from './main-logo';

export const MainHeader = () => {
  return (
    <div className="bg-[#001731] text-white h-20 flex items-center justify-between px-6 py-3">
      <MainLogo />

      <MainHeaderNav />

      <div className="flex items-center gap-x-3">
        <Button isIconOnly className="bg-[#FFFFFF1A] size-12 rounded-[14px]">
          {icons.search}
        </Button>
        <Button isIconOnly className="bg-[#FFFFFF1A] size-12 rounded-[14px]">
          {icons.bell}
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Avatar className="size-10" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions" variant="flat">
            <DropdownItem key="logout">Đăng xuất</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};
