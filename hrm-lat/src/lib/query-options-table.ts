/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions, type UndefinedInitialDataOptions } from "@tanstack/react-query";

import type { QueryOptionsListResponse } from "@/types";

export type QueryOptionsTable<T, R extends Record<string, any>, M = object> = ReturnType<
  typeof queryOptions<QueryOptionsListResponse<T, M>>
> & {
  __phantom?: {
    data: T;
    filters: R;
    meta: M;
  };
};

export const queryOptionsTable = <T, R extends Record<string, any>, M = object>(
  options: UndefinedInitialDataOptions<
    QueryOptionsListResponse<T, M>,
    Error,
    QueryOptionsListResponse<T, M>,
    readonly unknown[]
  >
): QueryOptionsTable<T, R, M> => {
  return queryOptions(options) as QueryOptionsTable<T, R, M>;
};
