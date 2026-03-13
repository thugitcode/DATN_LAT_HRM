import { useMemo } from 'react';

import { useDepartmentOptions } from './options/use-department-options';

export const useDepartmentName = ({ departmentId }: { departmentId?: string }) => {
  const { options: departmentOptions } = useDepartmentOptions();

  const departmentName = useMemo(() => {
    if (!departmentId) return '';
    return departmentOptions.find((d) => d.key === departmentId)?.label ?? '';
  }, [departmentOptions, departmentId]);

  return { departmentName };
};
