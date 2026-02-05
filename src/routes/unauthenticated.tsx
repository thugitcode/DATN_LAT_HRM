import { createFileRoute } from '@tanstack/react-router';

import { idbPersister } from '@/lib/idb-persister';
import { CommonErrorComponent } from '@/components/common-error-component';

export const Route = createFileRoute('/unauthenticated')({
  beforeLoad: async () => {
    await idbPersister.removeClient();

    localStorage.removeItem('jwt');
  },
  component: () => <CommonErrorComponent type="auth" />,
});
