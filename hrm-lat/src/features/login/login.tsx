import { useState } from 'react';
import { Button, Card, CardBody, Input } from '@heroui/react';
import imageLoginBg from '@public/images/login-bg.jpg';
import imageLogoHRM from '@public/images/logo-hrm-full.svg';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';

export const Login = () => {
  // 1. Khai báo state để lưu dữ liệu người dùng gõ vào
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Hàm xử lý khi bấm nút Đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn việc tự động load lại trang
    setIsLoading(true);

    try {
      // GỌI API BACKEND
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Lưu thông tin user và jwt vào trình duyệt
        localStorage.setItem('user', JSON.stringify(result.data));
        localStorage.setItem('jwt', 'hrm-local-token-' + result.data.id);
        
        // Chuyển hướng vào hệ thống
        window.location.href = '/admin/timekeeping-shift-scheduling/timekeeping-management';
      } else {
        alert(result.message); // Báo lỗi sai tài khoản/mật khẩu
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      alert("Không thể kết nối đến máy chủ Backend!");
    } finally {
      setIsLoading(false);
    }
  };

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
              <img src={imageLogoHRM} alt="HRM Logo" className="w-[220px]" />

              {/* Description */}
              <p className="text-center text-base text-default-600">
                Hệ thống quản trị nhân sự tích hợp chấm công và tính lương tự động dành cho cơ sở y tế
              </p>

              {/* Form Đăng nhập mới thay thế cho nút bấm Keycloak */}
              <form onSubmit={handleLogin} className="flex w-full flex-col gap-4 mt-2">
                <Input
                  label="Tên đăng nhập"
                  variant="bordered"
                  placeholder="Nhập admin..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  isRequired
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  variant="bordered"
                  placeholder="Nhập 123456..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isRequired
                />
                
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="bg-[#ff548e] font-semibold text-white mt-4"
                  endContent={!isLoading && <IconCircleArrowRightFilled size={20} />}
                >
                  Đăng nhập
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="flex flex-wrap justify-between gap-2 font-medium text-white">
          <span>Trường: TLU </span>
          <span>SVTH: Luu Anh Thu</span>
          <span>Made by Shenoryl</span>
          <span>Please don't copyright</span>
        </div>
      </div>
    </div>
  );
};