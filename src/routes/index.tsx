import { createFileRoute, redirect } from '@tanstack/react-router';
import type { GlobalSearchParams } from '@/types/global.type';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context: { auth }, search }) => {
    const { jwt, partner_code } = search as GlobalSearchParams;

    if (partner_code) {
      localStorage.setItem('partner_code', partner_code);
    }

    // Flow 1: CIS/external system truyền token qua URL (?jwt=TOKEN)
    if (jwt) {
      localStorage.setItem('jwt', jwt);
      throw redirect({ to: '/admin/timekeeping-shift-scheduling' });
    }

    // Flow 2: Đã có token từ lần trước
    const localJwt = localStorage.getItem('jwt');
    if (localJwt) {
      throw redirect({ to: '/admin/timekeeping-shift-scheduling' });
    }

    // Flow 3: Keycloak login trực tiếp tại HRM
    if (auth?.isLoggedIn) {
      throw redirect({ to: '/admin/timekeeping-shift-scheduling' });
    }

    throw redirect({ to: '/login' });
  },
});
