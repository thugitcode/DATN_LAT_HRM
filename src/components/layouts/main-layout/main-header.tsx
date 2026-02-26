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
    <div className="bg-[#000B18] text-white h-20 grid grid-cols-3 items-center px-6 py-3 border-b border-white/5">
      <div className="flex justify-start">
        <MainLogo />
      </div>

      <div className="flex justify-center">
        <MainHeaderNav />
      </div>

      <div className="flex justify-end items-center gap-x-3">
        <Button isIconOnly className="bg-white/10 hover:bg-white/20 size-11 rounded-[14px] transition-colors">
          {icons.search}
        </Button>
        <Button isIconOnly className="bg-white/10 hover:bg-white/20 size-11 rounded-[14px] transition-colors">
          {icons.bell}
        </Button>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar className="size-10 cursor-pointer hover:opacity-80 transition-opacity" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile">Hồ sơ của tôi</DropdownItem>
            <DropdownItem key="settings">Cài đặt</DropdownItem>
            <DropdownItem key="logout" color="danger">Đăng xuất</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};
