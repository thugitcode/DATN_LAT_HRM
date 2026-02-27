import { useState } from 'react';
import { useStaffDetail, useUpdateStaff } from '@/query-options/staff';
import { PageContainer } from '@/components/page-container';
import { StaffDetailHeader, StaffDetailInfo, StaffContractInfo } from './components';
import { Tabs, Tab, Button } from '@heroui/react';
import { IconPencil, IconDeviceFloppy, IconX } from '@tabler/icons-react';

interface StaffDetailProps {
    id: string;
}

export const StaffDetail = ({ id }: StaffDetailProps) => {
    const { data: response, isLoading } = useStaffDetail(id);
    const updateStaffMutation = useUpdateStaff();
    const staff = response?.data;
    const [isEditingAll, setIsEditingAll] = useState(false);

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
                    classNames={{
                        base: "border-b border-divider w-full",
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-[#006FEE]",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-[#006FEE] group-data-[selected=true]:font-semibold text-[#71717A]"
                    }}
                >
                    <Tab key="info" title="Thông tin nhân viên">
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
                    <Tab key="contract" title="Thông tin hợp đồng">
                        <StaffContractInfo staffId={id} />
                    </Tab>
                    <Tab key="salary" title="Lương và phúc lợi" />
                    <Tab key="attendance" title="Quản lý chấm công" />
                    <Tab key="documents" title="Hồ sơ nhân viên" />
                </Tabs>
            </div>
        </PageContainer>
    );
};
