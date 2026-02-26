import { useState } from 'react';
import { useStaffDetail } from '@/query-options/staff';
import { PageContainer } from '@/components/page-container';
import { StaffDetailHeader } from './components/staff-detail-header';
import { StaffDetailInfo } from './components/staff-detail-info';
import { Tabs, Tab } from '@heroui/react';

interface StaffDetailProps {
    id: string;
}

export const StaffDetail = ({ id }: StaffDetailProps) => {
    const { data: response, isLoading } = useStaffDetail(id);
    const staff = response?.data;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#F8F9FA]">
                <div className="w-10 h-10 border-4 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="flex h-full items-center justify-center bg-[#F8F9FA]">
                <p className="text-[#71717A]">Không tìm thấy thông tin nhân viên</p>
            </div>
        );
    }

    return (
        <PageContainer className="p-6 bg-[#F8F9FA] min-h-full space-y-4">
            <StaffDetailHeader staff={staff} />

            <div className="w-full">
                <Tabs
                    variant="underlined"
                    aria-label="Staff detail tabs"
                    classNames={{
                        base: "border-b border-divider w-full",
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-[#006FEE]",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-[#006FEE] group-data-[selected=true]:font-semibold text-[#71717A]"
                    }}
                >
                    <Tab key="info" title="Thông tin nhân viên">
                        <StaffDetailInfo staff={staff} />
                    </Tab>
                    <Tab key="contract" title="Thông tin hợp đồng" />
                    <Tab key="salary" title="Lương và phúc lợi" />
                    <Tab key="attendance" title="Quản lý chấm công" />
                    <Tab key="documents" title="Hồ sơ nhân viên" />
                </Tabs>
            </div>
        </PageContainer>
    );
};
