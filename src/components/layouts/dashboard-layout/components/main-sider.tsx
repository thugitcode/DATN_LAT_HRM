import { Link, useLocation } from '@tanstack/react-router';
import { AspectRatio, Box, Flex, Group, Stack } from '@mantine/core';

import { cn } from '@/lib/utils';
import { useMainMenu } from '@/hooks/common/use-main-menu';
import { Icons } from '@/components/icons';

import styles from '../styles/dashboard-layout.module.css';

export const MainSider = () => {
  const { menu } = useMainMenu();
  const { pathname } = useLocation();

  return (
    <Box className={styles.mainSiderWrapper}>
      <Flex direction="column" className={cn(styles.mainSider, styles.sider)}>
        <Box component={Link} to="/" className={styles.mainSiderTopbar}>
          <Flex align="center" gap="xs" className={styles.mainSiderTopbarContent}>
            <AspectRatio ratio={120 / 26} w={180} lh={0}>
              <Box component={Icons.dcLogoText} />
            </AspectRatio>
          </Flex>
        </Box>

        <Stack flex={1} py="lg">
          {menu.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = pathname.includes(item.link as string);

            let strokeprimary = '#fff';
            let strokesecondary = '#fff';
            let stroketertiary = '#fff';

            if (!isActive) {
              strokeprimary = '#2C80FF';
              strokesecondary = '#24E0E0';

              switch (item.icon) {
                case 'category':
                  strokeprimary = '#6576FF';
                  strokesecondary = '#57DFBF';
                  stroketertiary = '#CDD3FF';
                  break;
                case 'folderUser':
                  strokeprimary = '#F5A835';
                  strokesecondary = '#FFD79B';
                  break;
                case 'setting':
                  strokeprimary = strokesecondary;
                  break;
                case 'calendarRounded':
                  strokeprimary = '#1EA7DA';
                  strokesecondary = '#24E0E0';
                  break;
                default:
                  break;
              }
            }

            return (
              <Box component={Link} key={item.key} to={item.link} className={styles.mainSiderItem}>
                <Flex align="center" className={styles.mainSiderItemInner}>
                  <Group justify="center" align="center" className={styles.mainSiderIconWrapper}>
                    <Box
                      component={Icon}
                      w={20}
                      strokeprimary={strokeprimary}
                      strokesecondary={strokesecondary}
                      stroketertiary={stroketertiary}
                    />
                  </Group>

                  <Box className={styles.mainSiderItemLabel}>{item.label}</Box>
                </Flex>
              </Box>
            );
          })}
        </Stack>
      </Flex>
    </Box>
  );
};
