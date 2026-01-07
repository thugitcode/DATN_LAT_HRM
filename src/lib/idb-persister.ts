import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";

import { logger } from "./logger";

const IDB_KEY = "reactQuery-prm";

/**
 * SIMPLIFIED IndexedDB Persister
 * Không cần debounce/idle vì persist chỉ xảy ra:
 * - Sau bootstrap (10s delay)
 * - Khi beforeunload
 */
export const idbPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      await set(IDB_KEY, client);
      logger.log("✅ Persisted to IndexedDB");
    } catch (error) {
      console.error("Failed to persist:", error);
    }
  },

  restoreClient: async () => {
    try {
      const client = await get<PersistedClient>(IDB_KEY);
      if (client) {
        logger.log(
          `✅ Restored from IndexedDB (${client.clientState.queries?.length || 0} queries)`
        );
      }
      return client;
    } catch (error) {
      console.error("Failed to restore:", error);
      return undefined;
    }
  },

  removeClient: async () => {
    try {
      await del(IDB_KEY);
      logger.log("✅ Cleared IndexedDB");
    } catch (error) {
      console.error("Failed to clear:", error);
    }
  },
};
