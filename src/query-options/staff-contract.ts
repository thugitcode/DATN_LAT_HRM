import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToast } from '@heroui/react';
import {
    fetchStaffContractsByStaffId,
    fetchContractDetail,
    approveContract,
    signContract,
    deleteContract,
    updateContract,
    createContract,
} from '@/services/staff-contract';

export const STAFF_CONTRACT_QUERY_KEY = {
    all: ['staff-contract'],
    byStaff: (staffId: string) => [...STAFF_CONTRACT_QUERY_KEY.all, 'by-staff', staffId],
    detail: (id: string) => [...STAFF_CONTRACT_QUERY_KEY.all, 'detail', id],
};

export const useStaffContracts = (staffId: string) => {
    return useQuery({
        queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId),
        queryFn: () => fetchStaffContractsByStaffId(staffId),
        enabled: !!staffId,
    });
};

export const useContractDetail = (contractId: string) => {
    return useQuery({
        queryKey: STAFF_CONTRACT_QUERY_KEY.detail(contractId),
        queryFn: () => fetchContractDetail(contractId),
        enabled: !!contractId,
    });
};

export const useCreateContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createContract(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: 'Thêm mới thành công',
                description: 'Hợp đồng mới đã được tạo',
                color: 'success',
            });
        },
        onError: (error: Error) => {
            addToast({
                title: 'Thêm mới thất bại',
                description: error.message || 'Có lỗi xảy ra khi thêm mới',
                color: 'danger',
            });
        },
    });
};

export const useApproveContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => approveContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: 'Duyệt thành công',
                description: 'Hợp đồng đã được duyệt',
                color: 'success',
            });
        },
    });
};

export const useSignContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => signContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: 'Ký thành công',
                description: 'Hợp đồng đã được ký',
                color: 'success',
            });
        },
    });
};

export const useDeleteContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => deleteContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: 'Xóa thành công',
                description: 'Hợp đồng đã được xóa',
                color: 'success',
            });
        },
    });
};

export const useUpdateContract = (staffId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateContract(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.detail(id) });
            addToast({
                title: 'Cập nhật thành công',
                description: 'Hợp đồng đã được cập nhật',
                color: 'success',
            });
        },
        onError: (error: Error) => {
            addToast({
                title: 'Cập nhật thất bại',
                description: error.message || 'Có lỗi xảy ra khi cập nhật',
                color: 'danger',
            });
        },
    });
};
