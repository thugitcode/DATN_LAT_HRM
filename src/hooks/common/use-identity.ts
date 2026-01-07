import { useSuspenseQuery } from "@tanstack/react-query";
import { identityQueryOptions } from "@/query-options";

export const useIdentity = () => {
  return useSuspenseQuery(identityQueryOptions()).data;
};
