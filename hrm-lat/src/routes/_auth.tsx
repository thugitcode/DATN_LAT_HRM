import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    // Tự tay kiểm tra thẻ ra vào (Local Storage) thay vì dùng cái auth mặc định bị lỗi
    const userStr = localStorage.getItem('user');

    // NẾU ĐÃ ĐĂNG NHẬP: Đá thẳng vào trang lưới Phân ca
    if (userStr) {
      throw redirect({ to: '/admin/timekeeping-shift-scheduling' });
    }
    
    // NẾU CHƯA ĐĂNG NHẬP: Mở rào chắn, cho phép hiển thị màn hình Login (<Outlet />)
  },

  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}