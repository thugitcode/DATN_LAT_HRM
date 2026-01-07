import React from 'react';
import { Flex } from '@mantine/core';

import { Header } from './components/header';
import { MainSider } from './components/main-sider';

type Props = React.PropsWithChildren;

export const DashboardLayout = ({ children }: Props) => {
  return (
    <Flex h="100vh" pos="relative" style={{ overflow: 'hidden' }}>
      <MainSider />

      <Flex direction="column" flex={1} style={{ overflow: 'hidden' }}>
        <Header />

        <Flex flex={1} style={{ overflow: 'hidden' }}>
          <Flex flex={1} direction={'column'} style={{ overflow: 'auto' }}>
            {children}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
