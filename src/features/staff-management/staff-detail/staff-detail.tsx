import { PageContainer } from '@/components/page-container';
import { useStaffDetail, useUpdateStaff } from '@/query-options/staff';
import { Button, Tab, Tabs } from '@heroui/react';
import { IconDeviceFloppy, IconPencil, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { StaffProfile } from '../profile-staff/staff-profile';
import { SalaryAndBenefits } from '../salary-and-benefits/salary-and-benefits';
import { TimeAttendanceManagementTab } from '../time-attendance-management/time-attendance-management-tab';
import { StaffContractInfo, StaffDetailHeader, StaffDetailInfo } from './components';
import { useStaffDetailTabs } from './hooks/use-staff-detail-tabs';
import { TAB_KEYS } from './types';


interface StaffDetailProps {
    id: string;
}

export const StaffDetail = ({ id }: StaffDetailProps) => {
    const { data: response, isLoading } = useStaffDetail(id);
    const updateStaffMutation = useUpdateStaff();
    const staff = response?.data;
    const [isEditingAll, setIsEditingAll] = useState(false);
    const { staffTabs, activeKey, onSelectionChange, activeTab } = useStaffDetailTabs();
    
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

    const handleSaveAll = () => {
        // Collect all edited fields from the form
        const formEl = document.getElementById('staff-detail-form') as HTMLFormElement;
        if (formEl) {
            const formData = new FormData(formEl);
            const data: Record<string, unknown> = {};

            // Get all unique keys from formData
            const keys = Array.from(new Set(Array.from((formData as any).keys() as string[])));

            keys.forEach(key => {
                const values = formData.getAll(key);
                const isArrayField = ['academicTitles', 'departmentIds', 'roomIds'].includes(key as string);

                if (values.length > 1 || isArrayField) {
                    // Filter and take first if multiple (unless it's an array field)
                    if (isArrayField) {
                        data[key] = values.filter(v => v !== '' && v !== '—');
                    } else {
                        const validVal = values.find(v => v !== '' && v !== '—');
                        data[key] = validVal || null;
                    }
                } else {
                    const value = values[0] as string;
                    if (value === '—' || value === '') {
                        data[key] = null;
                    } else {
                        data[key] = value;
                    }
                }
            });

            updateStaffMutation.mutate({ id, data }, {
                onSuccess: () => setIsEditingAll(false),
            });
        }
    };

    const handleCancelAll = () => {
        setIsEditingAll(false);
    };

    return (
        <PageContainer className="p-6 bg-[#F8F9FA] min-h-full space-y-4">
            <StaffDetailHeader staff={staff} />

            <div className="w-full">
                <Tabs
                    variant="underlined"
                    aria-label="Staff detail tabs"
                    selectedKey={activeKey}
                    onSelectionChange={(key) => onSelectionChange(key as TAB_KEYS)}
                >
                    <Tab key={TAB_KEYS.INFO} title="Thông tin nhân viên">
                        {/* Title + Global Edit/Save/Cancel */}
                        <div className="flex items-center justify-between mt-4 mb-4">
                            <h2 className="text-lg font-bold text-[#11181C]">Thông tin nhân viên</h2>
                            <div className="flex items-center gap-2">
                                {isEditingAll ? (
                                    <>
                                        <Button
                                            variant="bordered"
                                            size="sm"
                                            className="bg-white border-[#E4E4E7] text-[#71717A] font-semibold h-9 rounded-lg px-4"
                                            startContent={<IconX size={16} />}
                                            onPress={handleCancelAll}
                                            isDisabled={updateStaffMutation.isPending}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            className="h-9 px-4 font-semibold rounded-lg bg-[#006FEE]"
                                            startContent={<IconDeviceFloppy size={16} />}
                                            onPress={handleSaveAll}
                                            isLoading={updateStaffMutation.isPending}
                                        >
                                            Lưu tất cả
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="flat"
                                        size="sm"
                                        className="bg-[#F4F4F5] text-[#11181C] font-semibold h-9 rounded-lg px-4"
                                        startContent={<IconPencil size={16} />}
                                        onPress={() => setIsEditingAll(true)}
                                    >
                                        Chỉnh sửa tất cả
                                    </Button>
                                )}
                            </div>
                        </div>
                        <StaffDetailInfo
                            staff={staff}
                            isEditingAll={isEditingAll}
                            onUpdate={(data) => updateStaffMutation.mutate({ id, data })}
                            isUpdating={updateStaffMutation.isPending}
                        />
                    </Tab>
                    <Tab key={TAB_KEYS.CONTRACT} title="Thông tin hợp đồng">
                        <StaffContractInfo staffId={id} />
                    </Tab>
                    <Tab key={TAB_KEYS.SALARY} title="Lương và phúc lợi" ><SalaryAndBenefits /></Tab>
                    <Tab key={TAB_KEYS.ATTENDANCE} title="Quản lý chấm công" ><TimeAttendanceManagementTab /></Tab>
                    <Tab key={TAB_KEYS.DOCUMENTS} title="Hồ sơ nhân viên" ><StaffProfile /></Tab>
                </Tabs>
            </div>
        </PageContainer>
    );
};
