import type { ApiResponse } from '@/types';
import type { StaffContract } from '@/types/staff.type';
import { hrmInstance, normalizeAxiosError } from '@/lib/axios';

export const fetchStaffContractsByStaffId = async (staffId: string): Promise<ApiResponse<StaffContract[]>> => {
    try {
        const response = await hrmInstance.get(`/staff-contract/staff/${staffId}`);
        return response.data;
    } catch (err: unknown) {
        throw normalizeAxiosError(err);
    }
};

export const fetchContractDetail = async (id: string): Promise<ApiResponse<StaffContract>> => {
    try {
        const response = await hrmInstance.get(`/staff-contract/${id}`);
        return response.data;
    } catch (err: unknown) {
        throw normalizeAxiosError(err);
    }
};

export const approveContract = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
        const response = await hrmInstance.post(`/staff-contract/${id}/approve`, {});
        return response.data;
    } catch (err: unknown) {
        throw normalizeAxiosError(err);
    }
};

export const signContract = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
        const response = await hrmInstance.post(`/staff-contract/${id}/sign`, {});
        return response.data;
    } catch (err: unknown) {
        throw normalizeAxiosError(err);
    }
};

export const deleteContract = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
        const response = await hrmInstance.delete(`/staff-contract/${id}`);
        return response.data;
    } catch (err: unknown) {
        throw normalizeAxiosError(err);
    }
};
