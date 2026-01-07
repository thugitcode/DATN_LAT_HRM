import { Avatar, Menu } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

import { useIdentity } from '@/hooks/common/use-identity';

export const AvatarMenu = () => {
  // const { identity } = useIdentity();
  // const { keycloak } = useKeycloak();

  return (
    <Menu shadow="md" width={200} trigger="hover">
      {/* <Menu.Target>
        <Avatar src={identity.ID} style={{ cursor: 'pointer' }}>
          {identity.HO.charAt(0) ?? identity.TEN.charAt(0)}
        </Avatar>
        
      </Menu.Target> */}

      <Menu.Dropdown>
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          // onClick={handleClickLogout}
        >
          Đăng xuất
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  // function handleClickLogout() {
  //   keycloak.logout();
  // }
};
