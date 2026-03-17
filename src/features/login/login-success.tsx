import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';


import { WINDOW_LOGIN_SUCCESS_MESSAGE } from './libs/constants';

export const LoginSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.opener) {
      const timeoutMsg = setTimeout(() => {
        window.opener.postMessage(WINDOW_LOGIN_SUCCESS_MESSAGE);
      }, 600);

      return () => {
        clearTimeout(timeoutMsg);
      };
    }

    router.history.replace('/login');
  }, [router.history]);

  return (
    // <CommonInitializingComponent h="100dvh" title="Đăng nhập thành công. Đang chuyển hướng..." />

    <div>CommonInitializingComponent</div>
  );
};
