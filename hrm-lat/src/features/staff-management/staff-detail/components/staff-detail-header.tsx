import { useEffect, useState, type FC } from 'react';
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
import { useOpenSignedFile } from '@/hooks/use-open-signed-file';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';
import { renderStatusChip } from '../../staff-list-management/hooks/use-staff-columns';

interface StaffDetailHeaderProps {
    staff: Staff;
}

export const StaffDetailHeader: FC<StaffDetailHeaderProps> = ({ staff }) => {
    const navigate = useNavigate();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)
    const { t: tc } = useTranslation(NAMESPACES.COMMON)
    const { getSignedUrlAndOpen } = useOpenSignedFile()
    const { data: listResponse } = useStaffList({
        getAll: true,
        contractType: staff.currentContractType as any
    });
    const [avatarSrc, setAvatarSrc] = useState("")
    useEffect(() => {
        staff.avatar && getSignedUrlAndOpen(staff.avatar, false).then((src) => {
            if (src) setAvatarSrc(src);
        });
    }, [staff.avatar])
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
                    className="bg-white rounded-full min-w-10 w-10 h-10"
                    onPress={handleBack}
                >
                    <IconArrowLeft size={20} className="text-[#71717A]" />
                </Button>

                <div className="flex items-center gap-3">
                    <Avatar
                        src={avatarSrc || `https://ui-avatars.com/api/?name=${staff.name}&background=random`}
                        className="w-12 h-12"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-[#11181C]">{staff.name}</h1>
                            {renderStatusChip(staff.status as any, tc)}
                        </div>
                        <p className="text-sm text-[#71717A] mt-0.5">{staff.code}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl px-3 h-10 mr-2">
                    <Button
                        isIconOnly
                        variant="light"
                        className="rounded-full bg-white"
                        isDisabled={!hasPrev}
                        onPress={handlePrev}
                    >
                        <IconChevronLeft size={18} className={hasPrev ? "text-[#11181C]" : "text-[#D4D4D8]"} />
                    </Button>

                    <Button
                        isIconOnly
                        variant="light"
                        className="rounded-full bg-white"
                        isDisabled={!hasNext}
                        onPress={handleNext}
                    >
                        <IconChevronRight size={18} className={hasNext ? "text-[#11181C]" : "text-[#D4D4D8]"} />
                    </Button>
                    <span className="text-sm font-medium text-[#11181C] min-w-[100px] text-center">
                        {displayIndex} / {totalStaff} {tc("staff")}
                    </span>
                </div>

                <Button
                    variant="bordered"
                    color='primary'
                    className="border-1 font-semibold h-10 rounded-xl px-4"
                    startContent={<IconScan size={18} className="text-[#6576FF]" />}
                >
                    {t('actions.reset_faceid')}
                </Button>

                <Button
                    color="primary"
                    className="h-10 px-4 font-semibold rounded-xl bg-[#6576FF]"
                    startContent={<IconMail size={18} />}
                    onPress={async () => {
                      try {
                        const res = await fetch(`http://localhost:5000/api/staff/${staff.id}/send-account`, { method: 'POST' });
                        const d = await res.json();
                        alert(d.message || 'Đã gửi email tài khoản!');
                      } catch { alert('Lỗi gửi email!'); }
                    }}
                >
                    {t('actions.send_email')}
                </Button>
            </div>
        </div>
    );
};