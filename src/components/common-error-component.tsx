import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@heroui/react';

type Props = {
  type?: 'auth' | 'system';
  isUnauthenticated?: boolean;
};

export const CommonErrorComponent = ({
  type = 'system',
  isUnauthenticated = false,
  ...props
}: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isUnauthenticated) {
      navigate({ to: '/unauthenticated' });
    }
  }, [isUnauthenticated, navigate]);

  if (isUnauthenticated) return null;

  let errorCode = null;
  let content = null;
  let action = null;

  switch (type) {
    case 'auth':
      errorCode = 401;
      content = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      action = (
        <Button onClick={() => (window.location.href = window.CIS_WEB_UI_URL)}>Đăng nhập</Button>
      );
      break;

    default:
      errorCode = 500;
      content = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      action = <Button onClick={() => location.reload()}>Tải lại trang</Button>;
      break;
  }

  return (
    <div>
      <div>{errorCode}</div>

      <div>{content}</div>

      {action}
    </div>
  );
};
