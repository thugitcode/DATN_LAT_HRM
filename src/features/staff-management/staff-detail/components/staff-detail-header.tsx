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

interface StaffDetailHeaderProps {
    staff: Staff;
}

export const StaffDetailHeader: FC<StaffDetailHeaderProps> = ({ staff }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button
                    isIconOnly
                    variant="flat"
                    className="bg-white border border-[#E4E4E7] rounded-full min-w-10 w-10 h-10 shadow-sm"
                    onPress={() => navigate({ to: '..' })}
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
                    <Button isIconOnly variant="light" size="sm" className="min-w-6 w-6 h-6">
                        <IconChevronLeft size={18} className="text-[#71717A]" />
                    </Button>
                    <span className="text-sm font-medium text-[#11181C]">1 / 35 nhân viên</span>
                    <Button isIconOnly variant="light" size="sm" className="min-w-6 w-6 h-6">
                        <IconChevronRight size={18} className="text-[#71717A]" />
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
