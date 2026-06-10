import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createContract(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: t('toast.success.create'),
                description: t('toast.description.contract_created'),
                color: 'success',
            });
        },
        onError: (error: Error) => {
            addToast({
                title: t('toast.error.create'),
                description: error.message || t('toast.description.error_create'),
                color: 'danger',
            });
        },
    });
};

export const useApproveContract = (staffId: string) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => approveContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: t('toast.success.approve'),
                description: t('toast.description.contract_approved'),
                color: 'success',
            });
        },
        onError: (error: Error) => {
            addToast({
                title: t('toast.error.approve'),
                description: error.message || t('toast.description.error_generic'),
                color: 'danger',
            });
        },
    });
};

export const useSignContract = (staffId: string) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => signContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: t('toast.success.sign'),
                description: t('toast.description.contract_signed'),
                color: 'success',
            });
        },
        onError: (error: Error) => {
            addToast({
                title: t('toast.error.sign'),
                description: error.message || t('toast.description.error_generic'),
                color: 'danger',
            });
        },
    });
};

export const useDeleteContract = (staffId: string) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contractId: string) => deleteContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            addToast({
                title: t('toast.success.delete'),
                description: t('toast.description.contract_deleted'),
                color: 'success',
            });
        },
        onError: (error: Error) => {
            addToast({
                title: t('toast.error.delete'),
                description: error.message || t('toast.description.error_generic'),
                color: 'danger',
            });
        },
    });
};

export const useUpdateContract = (staffId: string) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateContract(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.byStaff(staffId) });
            queryClient.invalidateQueries({ queryKey: STAFF_CONTRACT_QUERY_KEY.detail(id) });
            addToast({
                title: t('toast.success.update'),
                description: t('toast.description.contract_updated'),
                color: 'success',
            });
        },
        onError: (error: Error) => {
            addToast({
                title: t('toast.error.update'),
                description: error.message || t('toast.description.error_update'),
                color: 'danger',
            });
        },
    });
};
