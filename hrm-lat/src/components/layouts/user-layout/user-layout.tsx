import { type FC, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import logoFull from '@public/images/logo-hrm-full.svg';
import { Image } from '@heroui/react';
import { IconCalendar, IconUser, IconFileText, IconLogout, IconCalendarEvent, IconBeach, IconFileDescription, IconMessageCircle } from '@tabler/icons-react';

const menuItems = [
  { path: '/user/profile',     label: 'Hồ sơ cá nhân',  icon: IconUser },
  { path: '/user/schedule',    label: 'Lịch phân ca',    icon: IconCalendarEvent },
  { path: '/user/timekeeping', label: 'Bảng chấm công',  icon: IconCalendar },
  { path: '/user/leave',       label: 'Đơn xin nghỉ',    icon: IconBeach },
  { path: '/user/explanation', label: 'Giải trình công',  icon: IconFileDescription },
  { path: '/user/feedback',    label: 'Phản hồi lương',   icon: IconMessageCircle },
  { path: '/user/payslip',     label: 'Phiếu lương',     icon: IconFileText },
];

const UserSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-[#2C3782] flex flex-col justify-between pt-6 px-3">
      <div className="flex flex-col items-center gap-6">
        <Image src={logoFull} alt="HRM Logo" width={200} height={80} className="object-contain" />
        <ul className="flex flex-col gap-1 w-full mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path as any}
                  className={cn(
                    'flex items-center gap-3 w-full rounded-[14px] h-12 px-6 text-[15px] transition-colors text-[#8F99D3]',
                    active && 'bg-primary text-white',
                  )}
                >
                  <Icon size={20} stroke={1.5} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="pb-6 px-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-[14px] h-12 px-6 text-[15px] text-[#8F99D3] hover:text-white hover:bg-red-500/20 transition-colors"
        >
          <IconLogout size={20} stroke={1.5} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

interface UserLayoutProps { children: ReactNode; }

export const UserLayout: FC<UserLayoutProps> = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <UserSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
            <span className="text-sm text-gray-500">Phân hệ nhân viên</span>
            <span className="text-sm font-medium text-gray-700">{user.full_name || user.username}</span>
          </div>
          <div className="flex-1 bg-[#F4F4F5] overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};