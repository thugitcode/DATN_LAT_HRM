import { createFileRoute } from '@tanstack/react-router';

import { idbPersister } from '@/lib/idb-persister';

export const Route = createFileRoute('/authenticated')({
  beforeLoad: async () => {
    await idbPersister.removeClient();

    localStorage.removeItem('jwt');
  },
  component: () => <>CommonErrorComponent</>,
});
