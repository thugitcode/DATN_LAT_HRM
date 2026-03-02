import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchStaffContractsByStaffId,
    approveContract,
    signContract,
    deleteContract,
} from '@/services/staff-contract';

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

export const useApproveContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => approveContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
        },
    });
};

export const useSignContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => signContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
        },
    });
};

export const useDeleteContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => deleteContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
        },
    });
};
