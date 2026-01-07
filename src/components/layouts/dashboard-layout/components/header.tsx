import { useMemo } from 'react';
import { useLocation, useMatchRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { ActionIcon, Box, Divider, Flex, Group, Tabs, Title } from '@mantine/core';

import { useMainMenu } from '@/hooks/common/use-main-menu';
import { Icons } from '@/components/icons';

import styles from '../styles/dashboard-layout.module.css';
import { AvatarMenu } from './avatar-menu';

export const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { menu } = useMainMenu();
  const matchRoute = useMatchRoute();
  const router = useRouter();

  const activeMenuItem = useMemo(() => {
    return menu.find((item) => pathname.includes(item.link as string));
  }, [menu, pathname]);

  // Lưu ý: thứ tự rất quan trọng đối với các matchRoute
  const title = useMemo(() => {
    if (!activeMenuItem) return 'Unknown';

    return activeMenuItem.label;
  }, [activeMenuItem]);

  return (
    <>
      <Group
        px="lg"
        mih="var(--header-height)"
        bg="white"
        justify="space-between"
        className={styles.header}
        py="xs"
      >
        <Group>
          <Title order={3}>{title}</Title>
        </Group>
        <Flex align={'center'}>
          <Group>
            <Icons.bell />
            <AvatarMenu />

            {/*<SelectLanguage />*/}
          </Group>
        </Flex>
      </Group>

      <Divider />
    </>
  );

  function handleGoBack() {
    router.history.back();
  }
};
