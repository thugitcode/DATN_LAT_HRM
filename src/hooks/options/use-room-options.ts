import { useRoom } from '../use-room';

export const useRoomOptions = () => {
  const { data } = useRoom({
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
