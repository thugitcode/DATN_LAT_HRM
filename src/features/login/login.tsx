import { useRef } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
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
    <div
      className="relative min-h-dvh w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${imageLoginBg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto flex h-dvh max-w-7xl flex-col justify-between px-6 py-8">
        {/* Spacer top */}
        <div className="h-[30dvh]" />

        {/* Login Card */}
        <Card className="mx-auto w-full max-w-lg rounded-2xl shadow-2xl" shadow="lg">
          <CardBody className="px-8 py-10">
            <div className="flex flex-col items-center gap-6">
              {/* Logo */}
              <img src={imageLogoH247} alt="H247 Logo" className="w-[220px]" />

              {/* Description */}
              <p className="text-center text-base text-default-600">
                Giải pháp thông minh quản lý phòng khám, chuỗi phòng khám đa khoa hiệu quả, tiện
                dụng, mọi lúc, mọi nơi trên mọi nền tảng
              </p>

              {/* Login Button */}
              <Button
                size="lg"
                onPress={handleLogin}
                className="bg-[#ff548e] font-semibold text-white"
                endContent={<IconCircleArrowRightFilled size={20} />}
              >
                Đăng nhập
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="flex flex-wrap justify-between gap-2 font-medium text-white">
          <span>
            Địa chỉ: Số 35 Lê Văn Thiêm, Phường Thanh Xuân Trung, Quận Thanh Xuân, TP Hà Nội
          </span>

          <span>
            Website:{' '}
            <a href="https://deepcare.io" className="underline" target="_blank" rel="noreferrer">
              Deepcare.io
            </a>
          </span>

          <span>Hotline: 1900 068 856</span>

          <span>Email: contact@deepcare.io</span>
        </div>
      </div>
    </div>
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
