import { useDepartment } from '../use-department';

export const useDepartmentOptions = () => {
  const { data } = useDepartment({
    page: 1,
    limit: 100,
  });
  return {
    options:
      data?.data?.map((item) => ({
        key: item.id,
        label: item.name,
        code: item.code,
      })) ?? [],
  };
};
