import { createFileRoute, redirect } from '@tanstack/react-router';

import type { GlobalSearchParams } from '@/types/global.type';

export const Route = createFileRoute('/')({
  // beforeLoad: () => {
  //   throw redirect({
  //     to: '/admin/dashboard',
  //   });
  // },

  // component: RouteComponent,

  beforeLoad: ({ search }) => {
    const { jwt } = search as GlobalSearchParams;
    const localJwt = localStorage.getItem('jwt');

    if (jwt) {
      localStorage.setItem('jwt', jwt);
    } else if (!localJwt) {
      throw redirect({ to: '/unauthenticated' });
    }

    throw redirect({ to: '/admin' });
  },
});
