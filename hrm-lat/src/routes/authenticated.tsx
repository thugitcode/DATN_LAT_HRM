import { createFileRoute } from '@tanstack/react-router';

import { idbPersister } from '@/lib/idb-persister';
import { LoginSuccess } from '@/features/login/login-success';

export const Route = createFileRoute("/authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginSuccess />;
}
