import React from 'react';

import { usePersistStaticData } from '@/hooks/common/use-persist-static-data';

export const PersistProvider = ({ children }: React.PropsWithChildren) => {
  usePersistStaticData(); // Restore + persist on beforeunload

  return children;
};
