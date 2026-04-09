import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  jwt: z.string().optional().catch(undefined),
  partner_code: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  beforeLoad: ({ context: { auth }, search }) => {
    const { jwt, partner_code } = search;

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
