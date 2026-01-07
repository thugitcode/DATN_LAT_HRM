import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Stack, Text, Title, type StackProps } from '@mantine/core';
import { useKeycloak } from '@react-keycloak/web';

type Props = StackProps & {
  type?: 'auth' | 'system';
  isUnauthenticated?: boolean;
  isUnauthorized?: boolean;
};

export const CommonErrorComponent = ({
  type = 'system',
  isUnauthenticated = false,
  isUnauthorized = false,
  ...props
}: Props) => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  useEffect(() => {
    if (isUnauthenticated) {
      navigate({ to: '/logout' });
    }
  }, [isUnauthenticated, navigate]);

  if (isUnauthenticated) return null;

  let errorCode = null;
  let content = null;
  let action = null;

  if (type === 'auth') {
    errorCode = 401;
    content = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    action = (
      <Button onClick={() => (window.location.href = window.CIS_WEB_UI_URL)}>Đăng nhập</Button>
    );
  } else if (isUnauthorized) {
    errorCode = 403;
    content = 'Tài khoản của bạn không có quyền truy cập.\n Vui lòng đăng nhập tài khoản hợp lệ.';
    action = <Button onClick={() => keycloak.logout()}>Đăng nhập lại</Button>;
  } else {
    errorCode = 500;
    content = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
    action = <Button onClick={() => location.reload()}>Tải lại trang</Button>;
  }

  return (
    <Stack align="center" justify="center" h="100%" {...props}>
      <Title order={1} ta="center">
        {errorCode}
      </Title>

      <Text ta="center" style={{ whiteSpace: 'pre-line' }}>
        {content}
      </Text>

      {action}
    </Stack>
  );
};
