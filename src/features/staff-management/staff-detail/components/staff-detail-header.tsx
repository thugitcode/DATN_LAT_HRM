import type { FC } from 'react';
import { Button, Chip, Avatar } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import {
    IconArrowLeft,
    IconChevronLeft,
    IconChevronRight,
    IconScan,
    IconMail
} from '@tabler/icons-react';
import type { Staff } from '@/types/staff.type';
import { useStaffList } from '@/query-options/staff';

interface StaffDetailHeaderProps {
    staff: Staff;
}

export const StaffDetailHeader: FC<StaffDetailHeaderProps> = ({ staff }) => {
    const navigate = useNavigate();

    const { data: listResponse } = useStaffList({
        getAll: true,
        contractType: staff.currentContractType as any
    });

    const handleBack = () => {
        const map: Record<string, string> = {
            'FULL_TIME': 'official-staff',
            'PROBATION': 'probationary-staff',
            'INTERNSHIP': 'apprentice-staff',
            'EXPERT_COOPERATION': 'partner-staff'
        };
        const typeStr = map[staff.currentContractType || ''] || 'official-staff';
        navigate({ to: `/admin/staff-management/${typeStr}` as any });
    };
    const allStaff = listResponse?.data || [];
    const totalStaff = listResponse?.pagination?.total || allStaff.length || 1;

    const currentIndex = allStaff.findIndex((s: any) => s.id === staff.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < allStaff.length - 1;

    const handlePrev = () => {
        if (hasPrev) {
            navigate({
                to: '/admin/staff-management/detail/$id',
                params: { id: allStaff[currentIndex - 1]?.id as string }
            });
        }
    };

    const handleNext = () => {
        if (hasNext) {
            navigate({
                to: '/admin/staff-management/detail/$id',
                params: { id: allStaff[currentIndex + 1]?.id as string }
            });
        }
    };

    const displayIndex = currentIndex !== -1 ? currentIndex + 1 : 1;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button
                    isIconOnly
                    variant="flat"
                    className="bg-white border border-[#E4E4E7] rounded-full min-w-10 w-10 h-10 shadow-sm"
                    onPress={handleBack}
                >
                    <IconArrowLeft size={20} className="text-[#71717A]" />
                </Button>

                <div className="flex items-center gap-3">
                    <Avatar
                        src={staff.avatar || `https://ui-avatars.com/api/?name=${staff.name}&background=random`}
                        className="w-12 h-12"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-[#11181C]">{staff.name}</h1>
                            <Chip size="sm" color="success" variant="flat" classNames={{ content: 'text-[#17C964] font-semibold text-[10px]' }} className="h-5 bg-[#E8FAF0]">
                                {staff.status === 'WORKING' ? 'Đang làm việc' : 'Nghỉ'}
                            </Chip>
                        </div>
                        <p className="text-sm text-[#71717A] mt-0.5">{staff.code}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-[#E4E4E7] rounded-xl px-3 h-10 shadow-sm mr-2">
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="min-w-6 w-6 h-6"
                        isDisabled={!hasPrev}
                        onPress={handlePrev}
                    >
                        <IconChevronLeft size={18} className={hasPrev ? "text-[#11181C]" : "text-[#D4D4D8]"} />
                    </Button>
                    <span className="text-sm font-medium text-[#11181C] min-w-[100px] text-center">
                        {displayIndex} / {totalStaff} nhân viên
                    </span>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="min-w-6 w-6 h-6"
                        isDisabled={!hasNext}
                        onPress={handleNext}
                    >
                        <IconChevronRight size={18} className={hasNext ? "text-[#11181C]" : "text-[#D4D4D8]"} />
                    </Button>
                </div>

                <Button
                    variant="bordered"
                    className="bg-white border-[#E4E4E7] text-[#11181C] font-semibold h-10 rounded-xl shadow-sm px-4"
                    startContent={<IconScan size={18} className="text-[#006FEE]" />}
                >
                    Cài đặt lại FaceID
                </Button>

                <Button
                    color="primary"
                    className="h-10 px-4 font-semibold rounded-xl shadow-sm bg-[#006FEE]"
                    startContent={<IconMail size={18} />}
                >
                    Gửi email
                </Button>
            </div>
        </div>
    );
};
