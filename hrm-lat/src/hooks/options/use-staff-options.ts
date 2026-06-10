import { useStaffList } from '@/query-options/staff';
import { ContractTypeEnum, StaffStatusEnum } from '@/types/staff.type';

export const useStaffOptions = (params?: { status: StaffStatusEnum, contractType?: ContractTypeEnum }) => {
  const { data } = useStaffList({
    getAll: true,
    status: params?.status,
    contractType: params?.contractType,
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
