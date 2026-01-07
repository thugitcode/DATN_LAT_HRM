import { createFileRoute, redirect } from "@tanstack/react-router";

import { idbPersister } from "@/lib/idb-persister";

export const Route = createFileRoute("/_private/logout")({
  beforeLoad: async ({ context: { auth } }) => {
    await idbPersister.removeClient();

    auth.logout();

    throw redirect({ to: "/login" });
  },
});
