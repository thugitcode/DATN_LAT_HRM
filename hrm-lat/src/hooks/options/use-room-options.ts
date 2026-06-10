import { useRoom } from '../use-room';

export const useRoomOptions = (departmentId?: string) => {
  const { data } = useRoom({
    page: 1,
    limit: 100,
    departmentId: departmentId,
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
