import { createFileRoute } from '@tanstack/react-router';
import { StaffList } from '@/features/staff-management/staff-list-management/staff-list';
import { ContractTypeEnum } from '@/types/staff.type';

const typeToConfig: Record<string, { title: string; contractType: ContractTypeEnum }> = {
    'official-staff': {
        title: 'Nhân viên chính thức',
        contractType: ContractTypeEnum.FULL_TIME,
    },
    'probationary-staff': {
        title: 'Nhân viên thử việc',
        contractType: ContractTypeEnum.PROBATION,
    },
    'apprentice-staff': {
        title: 'Nhân viên học việc',
        contractType: ContractTypeEnum.INTERNSHIP,
    },
    'partner-staff': {
        title: 'Nhân sự hợp tác',
        contractType: ContractTypeEnum.EXPERT_COOPERATION,
    },
};

export const Route = createFileRoute('/_private/admin/_dashboard/staff-management/$type')({
    component: StaffManagementRoute,
});

function StaffManagementRoute() {
    const { type } = Route.useParams();
    const config = typeToConfig[type];

    if (!config) {
        return <div>Trang không tồn tại</div>;
    }

    return <StaffList title={config.title} contractType={config.contractType} />;
}
