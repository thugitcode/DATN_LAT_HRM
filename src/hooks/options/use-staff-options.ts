import { useStaffList } from '@/query-options/staff';

export const useStaffOptions = () => {
  const { data } = useStaffList({
    page: 1,
    limit: 100,
  });
  return {
    options:
      data?.data?.map((item) => ({
        key: item.id,
        label: item.name,
        code: item.code,
        departments: item.departments,
        rooms: item.rooms,
      })) ?? [],
  };
};
