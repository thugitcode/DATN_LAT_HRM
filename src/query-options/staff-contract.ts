import { useQuery } from '@tanstack/react-query';
import { fetchStaffContractsByStaffId } from '@/services/staff-contract';

export const STAFF_CONTRACT_QUERY_KEY = {
    all: ['staff-contract'],
    byStaff: (staffId: string) => [...STAFF_CONTRACT_QUERY_KEY.all, 'by-staff', staffId],
};

export const useStaffContracts = (staffId: string) => {
    return useQuery({
        queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId),
        queryFn: () => fetchStaffContractsByStaffId(staffId),
        enabled: !!staffId,
    });
};
