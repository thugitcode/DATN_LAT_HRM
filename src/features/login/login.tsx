import { useRef } from 'react';
import imageLoginBg from '@public/images/login-bg.jpg';
import imageLogoH247 from '@public/images/logo-h247.svg';
import { useKeycloak } from '@react-keycloak/web';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';

import { useEventListener } from '@/hooks/common/use-event-listener';

import { WINDOW_LOGIN_SUCCESS_MESSAGE } from './libs/constants';

export const Login = () => {
  const { keycloak } = useKeycloak();
  const keycloakWindowRef = useRef<Window | null>(null);

  useEventListener('message', handleMessage, window, true);

  return (
    // <BackgroundImage src={imageLoginBg}>
    //   <Container size="xl" h="100dvh" p="xl">
    //     <Stack h="100%" gap="xl" justify="space-between">
    //       <Box h="30dvh" />

    //       <Paper p="xl" radius="lg">
    //         <Container size="sm">
    //           <Stack align="center" gap="xl">
    //             <Image src={imageLogoH247} w={220} />

    //             <Text ta="center" fz="lg">
    //               Giải pháp thông minh quản lý phòng khám, chuỗi phòng khám đa khoa hiệu quả, tiện
    //               dụng, mọi lúc, mọi nơi trên mọi nền tảng
    //             </Text>

    //             <Button
    //               size="lg"
    //               onClick={handleLogin}
    //               bg="#ff548e"
    //               rightSection={<IconCircleArrowRightFilled />}
    //             >
    //               Đăng nhập
    //             </Button>
    //           </Stack>
    //         </Container>
    //       </Paper>

    //       <Group c="white" justify="space-between" fw={500}>
    //         <Text fw="inherit">
    //           Địa chỉ: Số 35 Lê Văn Thiêm, Phường Thanh Xuân Trung, Quận Thanh Xuân, TP Hà Nội
    //         </Text>

    //         <Text fw="inherit">
    //           Website:{' '}
    //           <Text component="a" href="https://deepcare.io" fw="inherit" td="underline">
    //             Deepcare.io
    //           </Text>
    //         </Text>

    //         <Text fw="inherit">Hotline: 1900 068 856</Text>

    //         <Text fw="inherit">Email: contact@deepcare.io</Text>
    //       </Group>
    //     </Stack>
    //   </Container>
    // </BackgroundImage>

    <div>Login</div>
  );

  async function handleLogin() {
    if (!window.top) {
      return console.error('window.top not found');
    }

    const keycloakWindow = keycloakWindowRef.current;

    if (keycloakWindow && !keycloakWindow.closed) {
      return keycloakWindow.focus();
    }

    const WIDTH = 800;
    const HEIGHT = 600;

    const TOP = window.top.outerHeight / 2 + window.top.screenY - HEIGHT / 2;
    const LEFT = window.top.outerWidth / 2 + window.top.screenX - WIDTH / 2;

    const loginUrl = keycloak.createLoginUrl({
      redirectUri: window.location.origin + '/authenticated',
    });

    let url = loginUrl;

    if (keycloak.authenticated) {
      const logoutUrl = keycloak.createLogoutUrl({
        redirectUri: loginUrl,
      });
      url = logoutUrl;
    }

    keycloakWindowRef.current = window.open(
      url,
      '_blank',
      `width=${WIDTH},height=${HEIGHT},top=${TOP},left=${LEFT}`,
    );
  }

  function handleMessage(e: MessageEvent) {
    if (e.data === WINDOW_LOGIN_SUCCESS_MESSAGE) {
      keycloakWindowRef.current?.close();
      keycloak.login();
    }
  }
};
